import { NextRequest, NextResponse } from 'next/server';
import { 
  getIssueById, 
  getWorkOrderByIssueId, 
  getWorkOrderById, 
  saveVerificationRecord,
  updateWorkOrderStatusRecord
} from '@/lib/db/queries';
import { verifyRepair } from '@/lib/ai/verification';
import { validateStatusTransition } from '@/lib/agent/stateMachine';
import { sanitizeServerError, AppError } from '@/lib/errors';
import { WorkOrderStatus, VerificationResult } from '@/types/domain';
import { logAuditEvent } from '@/lib/audit/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function fetchImageBuffer(url: string): Promise<Buffer> {
  if (url.startsWith('data:image/')) {
    const base64Data = url.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download evidence image from URL: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const correlationId = `req_${Date.now().toString(36)}`;

  try {
    const { id } = await params;

    if (!id) {
      throw new AppError('VALIDATION_ERROR', 'Issue or Work Order ID is required.', 400);
    }

    // 1. Resolve work order and issue records
    let workOrder = await getWorkOrderByIssueId(id);
    if (!workOrder) {
      workOrder = await getWorkOrderById(id);
    }

    if (!workOrder) {
      throw new AppError('VALIDATION_ERROR', 'No active work order found for verification.', 404);
    }

    const issue = await getIssueById(workOrder.issueId);
    if (!issue) {
      throw new AppError('ISSUE_NOT_FOUND', 'Issue not found.', 404);
    }

    if (!workOrder.afterImageUrl) {
      throw new AppError('VALIDATION_ERROR', 'No after-repair photograph has been uploaded yet.', 400);
    }

    await logAuditEvent({
      issueId: issue.id,
      workOrderId: workOrder.id,
      eventType: 'VERIFICATION_STARTED',
      previousStatus: workOrder.status,
      actorType: 'AI_AGENT',
      details: 'Started 2nd-stage visual repair verification comparing before vs after evidence.',
      correlationId,
    });

    // 2. Download image buffers for multimodal AI engine
    const [beforeBuffer, afterBuffer] = await Promise.all([
      fetchImageBuffer(issue.beforeImageUrl),
      fetchImageBuffer(workOrder.afterImageUrl),
    ]);

    // 3. Execute 2nd Stage AI Repair Verification Engine
    const verificationAnalysis = await verifyRepair({
      beforeImageBuffer: beforeBuffer,
      afterImageBuffer: afterBuffer,
      description: issue.description,
      location: issue.location,
      category: workOrder.category,
      severity: workOrder.severity,
      problem: workOrder.problem,
    });

    const { verification, modelName, promptVersion, latencyMs } = verificationAnalysis;

    // 4. Save verification attempt to Neon database
    const savedVerification = await saveVerificationRecord({
      workOrderId: workOrder.id,
      issueId: issue.id,
      beforeImageUrl: issue.beforeImageUrl,
      afterImageUrl: workOrder.afterImageUrl,
      result: verification.result as VerificationResult,
      confidence: verification.confidence,
      reasoning: verification.reasoning,
      model: modelName,
      promptVersion,
      latencyMs,
      problemResolved: verification.problemResolved,
      remainingIssues: verification.remainingIssues,
      evidenceAssessment: verification.evidenceAssessment,
    });

    // 5. Determine next state based on deterministic business rules
    let nextStatus: WorkOrderStatus;
    let eventType = 'VERIFICATION_COMPLETED';

    if (verification.result === 'PASS') {
      nextStatus = 'VERIFIED';
      eventType = 'VERIFICATION_COMPLETED';
    } else if (verification.result === 'FAIL') {
      nextStatus = 'REOPENED';
      eventType = 'VERIFICATION_FAILED';
    } else {
      nextStatus = 'PENDING_REVIEW';
      eventType = 'VERIFICATION_INCONCLUSIVE';
    }

    // Validate state transition using state machine
    validateStatusTransition(workOrder.status as WorkOrderStatus, nextStatus);

    // Update status in database
    const updatedWO = await updateWorkOrderStatusRecord(workOrder.id, nextStatus);

    await logAuditEvent({
      issueId: issue.id,
      workOrderId: workOrder.id,
      eventType,
      previousStatus: workOrder.status,
      newStatus: nextStatus,
      actorType: 'AI_AGENT',
      details: `Verification result: ${verification.result} (${(verification.confidence * 100).toFixed(0)}% confidence). ${verification.reasoning}`,
      metadata: {
        result: verification.result,
        confidence: verification.confidence,
        problemResolved: verification.problemResolved,
        remainingIssues: verification.remainingIssues,
        latencyMs,
      },
      correlationId,
    });

    // If PASS, cleanly transition to CLOSED
    if (nextStatus === 'VERIFIED') {
      validateStatusTransition('VERIFIED', 'CLOSED');
      await updateWorkOrderStatusRecord(workOrder.id, 'CLOSED');

      await logAuditEvent({
        issueId: issue.id,
        workOrderId: workOrder.id,
        eventType: 'ISSUE_CLOSED',
        previousStatus: 'VERIFIED',
        newStatus: 'CLOSED',
        actorType: 'SYSTEM',
        details: 'Issue verified successfully and closed.',
        correlationId,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Repair verification finished with result: ${verification.result}`,
      verification: savedVerification,
      nextStatus,
      workOrder: updatedWO,
    });
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/verify/[id]');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: safeError.code,
          message: safeError.message,
        },
      },
      { status: safeError.statusCode }
    );
  }
}
