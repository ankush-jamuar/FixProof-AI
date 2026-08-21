import { z } from 'zod';
import { getWorkOrderById, updateWorkOrderStatusRecord } from '@/lib/db/queries';
import { validateStatusTransition } from '@/lib/agent/stateMachine';
import { WorkOrder, WorkOrderStatus } from '@/types/domain';
import { AppError } from '@/lib/errors';

export const UpdateWorkOrderStatusInputSchema = z.object({
  workOrderId: z.string().min(1, 'Work order ID is required'),
  nextStatus: z.enum([
    'REPORTED',
    'ANALYZING',
    'PENDING_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'PENDING_VERIFICATION',
    'VERIFIED',
    'REOPENED',
    'ESCALATED',
    'CLOSED',
  ]),
  afterImageUrl: z.string().optional(),
  technicianNotes: z.string().optional(),
});

export type UpdateWorkOrderStatusInput = z.infer<typeof UpdateWorkOrderStatusInputSchema>;

export async function executeUpdateWorkOrderStatus(input: UpdateWorkOrderStatusInput): Promise<WorkOrder> {
  const validated = UpdateWorkOrderStatusInputSchema.parse(input);

  const existingWO = await getWorkOrderById(validated.workOrderId);
  if (!existingWO) {
    throw new AppError('VALIDATION_ERROR', 'Work order not found.', 404);
  }

  // Enforce central state machine transition rules
  validateStatusTransition(existingWO.status as WorkOrderStatus, validated.nextStatus as WorkOrderStatus);

  // If transitioning to PENDING_VERIFICATION, verify after-repair image is provided
  if (validated.nextStatus === 'PENDING_VERIFICATION' && !validated.afterImageUrl && !existingWO.afterImageUrl) {
    throw new AppError('VALIDATION_ERROR', 'An after-repair photograph is required to complete repair work.', 400);
  }

  const updatedWO = await updateWorkOrderStatusRecord(validated.workOrderId, validated.nextStatus as WorkOrderStatus, {
    afterImageUrl: validated.afterImageUrl,
    technicianNotes: validated.technicianNotes,
  });

  return updatedWO as WorkOrder;
}
