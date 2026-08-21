import { WorkOrderStatus } from '@/types/domain';
import { AppError } from '@/lib/errors';

/**
 * Strict state machine mapping for FixProof AI work orders and issues.
 * Prevents illegal or unauthorized status jumps (e.g. REPORTED -> CLOSED, ASSIGNED -> PENDING_VERIFICATION).
 */
export const VALID_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  REPORTED: ['ANALYZING'],
  ANALYZING: ['PENDING_REVIEW', 'ASSIGNED'],
  PENDING_REVIEW: ['ASSIGNED', 'ESCALATED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['PENDING_VERIFICATION'],
  PENDING_VERIFICATION: ['VERIFIED', 'REOPENED', 'PENDING_REVIEW'],
  VERIFIED: ['CLOSED'],
  REOPENED: ['ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'PENDING_REVIEW'],
  ESCALATED: ['ASSIGNED', 'CLOSED'],
  CLOSED: [],
};

export function validateStatusTransition(currentStatus: WorkOrderStatus, nextStatus: WorkOrderStatus): boolean {
  if (currentStatus === nextStatus) return true; // Idempotent no-op

  const allowed = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
      400,
      `State machine rejection: cannot transition from ${currentStatus} to ${nextStatus}.`
    );
  }
  return true;
}
