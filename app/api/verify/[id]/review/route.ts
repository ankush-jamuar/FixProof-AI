import { NextRequest, NextResponse } from 'next/server';
import { getWorkOrderByIssueId, getWorkOrderById, updateWorkOrderStatusRecord } from '@/lib/db/queries';
import { validateStatusTransition } from '@/lib/agent/stateMachine';
import { sanitizeServerError, AppError } from '@/lib/errors';
import { WorkOrderStatus } from '@/types/domain';
import { logAuditEvent } from '@/lib/audit/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const correlationId = `req_${Date.now().toString(36)}`;

  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'APPROVE' or 'REJECT'

    if (!action || !['APPROVE', 'REJECT'].includes(action)) {
      throw new AppError('VALIDATION_ERROR', 'Action must be APPROVE or REJECT.', 400);
    }

    let workOrder = await getWorkOrderByIssueId(id);
    if (!workOrder) {
      workOrder = await getWorkOrderById(id);
    }

    if (!workOrder) {
      throw new AppError('VALIDATION_ERROR', 'Work order not found.', 404);
    }

    const nextStatus: WorkOrderStatus = action === 'APPROVE' ? 'VERIFIED' : 'REOPENED';
    validateStatusTransition(workOrder.status as WorkOrderStatus, nextStatus);

    const updatedWO = await updateWorkOrderStatusRecord(workOrder.id, nextStatus);

    await logAuditEvent({
      issueId: workOrder.issueId,
      workOrderId: workOrder.id,
      eventType: 'SUPERVISOR_VERIFICATION',
      previousStatus: workOrder.status,
      newStatus: nextStatus,
      actorType: 'SUPERVISOR',
      details: `Supervisor manually ${action === 'APPROVE' ? 'approved repair (VERIFIED/CLOSED)' : 'rejected repair (REOPENED)'}.`,
      correlationId,
    });

    if (nextStatus === 'VERIFIED') {
      validateStatusTransition('VERIFIED', 'CLOSED');
      await updateWorkOrderStatusRecord(workOrder.id, 'CLOSED');

      await logAuditEvent({
        issueId: workOrder.issueId,
        workOrderId: workOrder.id,
        eventType: 'ISSUE_CLOSED',
        previousStatus: 'VERIFIED',
        newStatus: 'CLOSED',
        actorType: 'SUPERVISOR',
        details: 'Issue verified and closed by supervisor.',
        correlationId,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Supervisor verification override set to ${nextStatus}.`,
      workOrder: updatedWO,
    });
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/verify/[id]/review');
    return NextResponse.json(
      {
        success: false,
        error: { code: safeError.code, message: safeError.message },
      },
      { status: safeError.statusCode }
    );
  }
}
