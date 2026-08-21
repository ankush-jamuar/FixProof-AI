import { NextRequest, NextResponse } from 'next/server';
import { getWorkOrderByIssueId, getWorkOrderById, updateWorkOrderStatusRecord } from '@/lib/db/queries';
import { validateStatusTransition } from '@/lib/agent/stateMachine';
import { sanitizeServerError, AppError } from '@/lib/errors';
import { WorkOrderStatus } from '@/types/domain';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    if (nextStatus === 'VERIFIED') {
      validateStatusTransition('VERIFIED', 'CLOSED');
      await updateWorkOrderStatusRecord(workOrder.id, 'CLOSED');
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
