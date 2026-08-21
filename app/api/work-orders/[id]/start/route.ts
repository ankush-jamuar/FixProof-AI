import { NextRequest, NextResponse } from 'next/server';
import { executeUpdateWorkOrderStatus } from '@/lib/tools/updateWorkOrderStatus';
import { sanitizeServerError, AppError } from '@/lib/errors';
import { logAuditEvent } from '@/lib/audit/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const correlationId = `req_${Date.now().toString(36)}`;

  try {
    const { id: workOrderId } = await params;

    if (!workOrderId) {
      throw new AppError('VALIDATION_ERROR', 'Work Order ID parameter is required.', 400);
    }

    const updatedWO = await executeUpdateWorkOrderStatus({
      workOrderId,
      nextStatus: 'IN_PROGRESS',
    });

    const issueId = (updatedWO as any)?.issueId || (updatedWO as any)?.issue_id;
    const technicianId = (updatedWO as any)?.technicianId || (updatedWO as any)?.technician_id;

    await logAuditEvent({
      issueId,
      workOrderId: updatedWO.id,
      technicianId: technicianId || undefined,
      eventType: 'WORK_STARTED',
      newStatus: 'IN_PROGRESS',
      actorType: 'TECHNICIAN',
      details: 'Technician initiated repair work on site.',
      correlationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Work order status updated to IN_PROGRESS.',
        workOrder: updatedWO,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/work-orders/[id]/start');
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
