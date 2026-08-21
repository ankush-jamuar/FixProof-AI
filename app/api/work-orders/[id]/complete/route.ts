import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/storage/cloudinary';
import { executeUpdateWorkOrderStatus } from '@/lib/tools/updateWorkOrderStatus';
import { validateImageFile } from '@/lib/validation/schemas';
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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const technicianNotes = (formData.get('technicianNotes') as string) || '';

    // 1. Validate photo evidence file
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid || !file) {
      throw new AppError('VALIDATION_ERROR', fileValidation.error || 'An after-repair photograph is required.', 400);
    }

    // 2. Convert to buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload to Cloudinary
    const uploadResult = await uploadImageToCloudinary(buffer, 'fixproof_repairs');

    // 4. Update status to PENDING_VERIFICATION via controlled state machine tool
    const updatedWO = await executeUpdateWorkOrderStatus({
      workOrderId,
      nextStatus: 'PENDING_VERIFICATION',
      afterImageUrl: uploadResult.url,
      technicianNotes,
    });

    const issueId = (updatedWO as any)?.issueId || (updatedWO as any)?.issue_id;
    const technicianId = (updatedWO as any)?.technicianId || (updatedWO as any)?.technician_id;

    await logAuditEvent({
      issueId,
      workOrderId: updatedWO.id,
      technicianId: technicianId || undefined,
      eventType: 'REPAIR_SUBMITTED',
      previousStatus: 'IN_PROGRESS',
      newStatus: 'PENDING_VERIFICATION',
      actorType: 'TECHNICIAN',
      details: 'Technician completed work and uploaded after-repair evidence photo.',
      correlationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Repair evidence uploaded successfully. Status updated to PENDING_VERIFICATION.',
        workOrder: updatedWO,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/work-orders/[id]/complete');
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
