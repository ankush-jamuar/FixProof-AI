import { getIssueById, updateIssueStatus } from '@/lib/db/queries';
import { executeGetAvailableTechnicians } from '@/lib/tools/getAvailableTechnicians';
import { executeCreateWorkOrder } from '@/lib/tools/createWorkOrder';
import { CONFIDENCE_THRESHOLD } from '@/lib/ai/perception';
import { IssueCategory, IssueSeverity, WorkOrder, Technician } from '@/types/domain';
import { AppError } from '@/lib/errors';

export interface AgentRunInput {
  issueId: string;
  supervisorOverrideCategory?: IssueCategory;
  supervisorOverrideSeverity?: IssueSeverity;
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
  const issue = await getIssueById(input.issueId);

  if (!issue) {
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
    return {
      success: false,
      issueId: issue.id,
      status: 'ESCALATED',
      reasoning: `No active available technicians found for category "${category}". Issue escalated for supervisor dispatch.`,
      requiresHumanReview: true,
    };
  }

  // 4. Deterministic technician selection strategy (selects first available category technician)
  const selectedTechnician = availableTechnicians[0];

  const agentReasoning = `Selected technician ${selectedTechnician.name} because: category match = ${category}, active availability = true. Assigned to handle ${severity} severity issue.`;

  // 5. Create work order using controlled tool
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
