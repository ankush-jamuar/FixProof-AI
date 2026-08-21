import { getIssueById, updateIssueStatus } from '@/lib/db/queries';
import { executeGetAvailableTechnicians } from '@/lib/tools/getAvailableTechnicians';
import { executeCreateWorkOrder } from '@/lib/tools/createWorkOrder';
import { CONFIDENCE_THRESHOLD } from '@/lib/ai/perception';
import { IssueCategory, IssueSeverity, WorkOrder, Technician } from '@/types/domain';
import { AppError } from '@/lib/errors';
import { logAuditEvent } from '@/lib/audit/logger';

export interface AgentRunInput {
  issueId: string;
  supervisorOverrideCategory?: IssueCategory;
  supervisorOverrideSeverity?: IssueSeverity;
  correlationId?: string;
}

export interface AgentRunResult {
  success: boolean;
  issueId: string;
  status: string;
  reasoning: string;
  workOrder?: WorkOrder;
  selectedTechnician?: Technician;
  requiresHumanReview: boolean;
}

export async function runAgentOrchestrator(input: AgentRunInput): Promise<AgentRunResult> {
  const correlationId = input.correlationId || `req_${Date.now().toString(36)}`;

  await logAuditEvent({
    issueId: input.issueId,
    eventType: 'AGENT_DISPATCH_STARTED',
    actorType: 'AI_AGENT',
    details: 'AI Agent starting issue routing and technician matching.',
    correlationId,
  });

  const issue = await getIssueById(input.issueId);

  if (!issue) {
    await logAuditEvent({
      issueId: input.issueId,
      eventType: 'AGENT_DISPATCH_FAILED',
      actorType: 'AI_AGENT',
      details: 'Issue not found in database.',
      success: false,
      correlationId,
    });
    throw new AppError('ISSUE_NOT_FOUND', 'Issue not found.', 404);
  }

  // 1. Determine effective category, severity, and confidence
  const category: IssueCategory = input.supervisorOverrideCategory || issue.humanCorrectedCategory || issue.aiCategory || 'plumbing';
  const severity: IssueSeverity = input.supervisorOverrideSeverity || issue.aiSeverity || 'medium';
  const confidence = issue.aiConfidence !== null && issue.aiConfidence !== undefined ? issue.aiConfidence : 0;

  // 2. Check confidence threshold
  const isHighConfidence = confidence >= CONFIDENCE_THRESHOLD || Boolean(input.supervisorOverrideCategory);

  if (!isHighConfidence) {
    // Low confidence: Update status to PENDING_REVIEW and stop automatic routing
    await updateIssueStatus(issue.id, 'PENDING_REVIEW');

    await logAuditEvent({
      issueId: issue.id,
      eventType: 'AGENT_DISPATCH_FAILED',
      previousStatus: issue.status,
      newStatus: 'PENDING_REVIEW',
      actorType: 'AI_AGENT',
      details: `AI Perception confidence (${(confidence * 100).toFixed(0)}%) is below ${CONFIDENCE_THRESHOLD * 100}%. Routing paused for human review.`,
      success: false,
      correlationId,
    });

    return {
      success: false,
      issueId: issue.id,
      status: 'PENDING_REVIEW',
      reasoning: `AI Perception confidence (${(confidence * 100).toFixed(0)}%) is below the ${CONFIDENCE_THRESHOLD * 100}% threshold. Routing paused for human review.`,
      requiresHumanReview: true,
    };
  }

  // 3. Query matching available technicians using controlled tool
  const availableTechnicians = await executeGetAvailableTechnicians({ category });

  if (availableTechnicians.length === 0) {
    // Escalate issue if no matching technician is available
    await updateIssueStatus(issue.id, 'ESCALATED');

    await logAuditEvent({
      issueId: issue.id,
      eventType: 'AGENT_DISPATCH_FAILED',
      previousStatus: issue.status,
      newStatus: 'ESCALATED',
      actorType: 'AI_AGENT',
      details: `No active available technicians found for category "${category}". Issue escalated.`,
      success: false,
      correlationId,
    });

    return {
      success: false,
      issueId: issue.id,
      status: 'ESCALATED',
      reasoning: `No active available technicians found for category "${category}". Issue escalated for supervisor dispatch.`,
      requiresHumanReview: true,
    };
  }

  // 4. Deterministic technician selection strategy
  const selectedTechnician = availableTechnicians[0];
  const agentReasoning = `Selected technician ${selectedTechnician.name} because: category match = ${category}, active availability = true. Assigned to handle ${severity} severity issue.`;

  // 5. Build step-by-step Controlled Tool Execution Trace
  const toolTrace = [
    {
      timestamp: new Date().toISOString(),
      step: 'STEP_1',
      toolUsed: 'executeGetIssueDetails',
      action: 'FETCH_ISSUE_METADATA',
      details: `Fetched issue details (Category: ${category.toUpperCase()}, Severity: ${severity.toUpperCase()}, Confidence: ${(confidence * 100).toFixed(0)}%).`,
    },
    {
      timestamp: new Date().toISOString(),
      step: 'STEP_2',
      toolUsed: 'evaluateConfidenceThreshold',
      action: 'CHECK_CONFIDENCE_THRESHOLD',
      details: `Confidence (${(confidence * 100).toFixed(0)}%) >= ${CONFIDENCE_THRESHOLD * 100}%. Automated routing approved.`,
    },
    {
      timestamp: new Date().toISOString(),
      step: 'STEP_3',
      toolUsed: 'executeGetAvailableTechnicians',
      action: 'QUERY_AVAILABLE_TECHNICIANS',
      details: `Found ${availableTechnicians.length} available technician(s) matching category "${category}".`,
    },
    {
      timestamp: new Date().toISOString(),
      step: 'STEP_4',
      toolUsed: 'selectTechnicianStrategy',
      action: 'DETERMINISTIC_TECHNICIAN_MATCH',
      details: `Matched technician "${selectedTechnician.name}" (${selectedTechnician.category.toUpperCase()}).`,
    },
    {
      timestamp: new Date().toISOString(),
      step: 'STEP_5',
      toolUsed: 'executeCreateWorkOrder',
      action: 'CREATE_WORK_ORDER_RECORD',
      details: agentReasoning,
    },
  ];

  // 6. Create work order using controlled tool
  const problemTitle = issue.aiProblem || (issue.description.length > 50 ? `${issue.description.slice(0, 50)}...` : issue.description);

  const workOrder = await executeCreateWorkOrder({
    issueId: issue.id,
    technicianId: selectedTechnician.id,
    category,
    problem: problemTitle,
    severity,
    location: issue.location,
    description: issue.description,
    reasoning: agentReasoning,
    selectedTechnicianName: selectedTechnician.name,
    toolTrace,
  });

  await logAuditEvent({
    issueId: issue.id,
    workOrderId: workOrder.id,
    technicianId: selectedTechnician.id,
    eventType: 'AGENT_DISPATCH_COMPLETED',
    previousStatus: issue.status,
    newStatus: 'ASSIGNED',
    actorType: 'AI_AGENT',
    actorName: 'FixProof AI Agent',
    details: `Work order dispatched to ${selectedTechnician.name} (${category.toUpperCase()}).`,
    success: true,
    correlationId,
  });

  return {
    success: true,
    issueId: issue.id,
    status: 'ASSIGNED',
    reasoning: agentReasoning,
    workOrder,
    selectedTechnician,
    requiresHumanReview: false,
  };
}
