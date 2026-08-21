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
    if (verification.result === 'PASS') {
      nextStatus = 'VERIFIED';
    } else if (verification.result === 'FAIL') {
      nextStatus = 'REOPENED';
    } else {
      nextStatus = 'PENDING_REVIEW';
    }

    // Validate state transition using state machine
    validateStatusTransition(workOrder.status as WorkOrderStatus, nextStatus);

    // Update status in database
    const updatedWO = await updateWorkOrderStatusRecord(workOrder.id, nextStatus);

    // If PASS, cleanly transition to CLOSED
    if (nextStatus === 'VERIFIED') {
      validateStatusTransition('VERIFIED', 'CLOSED');
      await updateWorkOrderStatusRecord(workOrder.id, 'CLOSED');
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
