import { NextRequest, NextResponse } from 'next/server';
import { executeUpdateWorkOrderStatus } from '@/lib/tools/updateWorkOrderStatus';
import { sanitizeServerError, AppError } from '@/lib/errors';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: workOrderId } = await params;

    if (!workOrderId) {
      throw new AppError('VALIDATION_ERROR', 'Work Order ID parameter is required.', 400);
    }

    const updatedWO = await executeUpdateWorkOrderStatus({
      workOrderId,
      nextStatus: 'IN_PROGRESS',
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
