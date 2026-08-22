import { WorkOrderStatus } from '@/types/domain';
import { AppError } from '@/lib/errors';
import { logAuditEvent } from '@/lib/audit/logger';

/**
 * Strict state machine mapping for FixProof AI work orders and issues.
 * Prevents illegal or unauthorized status jumps (e.g. REPORTED -> CLOSED, ASSIGNED -> PENDING_VERIFICATION).
 */
export const VALID_STATUS_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  REPORTED: ['ANALYZING'],
  ANALYZING: ['PENDING_REVIEW', 'ASSIGNED'],
  PENDING_REVIEW: ['ASSIGNED', 'ESCALATED', 'VERIFIED', 'REOPENED', 'CLOSED'],
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
    // Log rejected status transition attempt
    logAuditEvent({
      eventType: 'ILLEGAL_STATUS_TRANSITION_REJECTED',
      previousStatus: currentStatus,
      newStatus: nextStatus,
      actorType: 'SYSTEM',
      details: `State machine rejected illegal transition from ${currentStatus} to ${nextStatus}.`,
      success: false,
    });

    throw new AppError(
      'VALIDATION_ERROR',
      `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
      400,
      `State machine rejection: cannot transition from ${currentStatus} to ${nextStatus}.`
    );
  }
  return true;
}
