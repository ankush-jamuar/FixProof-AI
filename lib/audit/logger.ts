export type ActorType = 'SYSTEM' | 'AI_AGENT' | 'TECHNICIAN' | 'SUPERVISOR';

export interface AuditEventInput {
  issueId?: string;
  workOrderId?: string;
  technicianId?: string;
  eventType: string;
  previousStatus?: string;
  newStatus?: string;
  actorType: ActorType;
  actorName?: string;
  details?: string;
  metadata?: Record<string, any>;
  success?: boolean;
  correlationId?: string;
}

export interface AuditEventRecord extends AuditEventInput {
  id: string;
  timestamp: string;
  success: boolean;
}

// Global server-side audit store fallback for production observability
const auditLogStore: AuditEventRecord[] = [];

/**
 * Log a structured audit event across server APIs, AI perception, agent routing, state machine transitions, technician actions, and verifications.
 */
export async function logAuditEvent(input: AuditEventInput): Promise<AuditEventRecord> {
  const eventRecord: AuditEventRecord = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    issueId: input.issueId,
    workOrderId: input.workOrderId,
    technicianId: input.technicianId,
    eventType: input.eventType,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    actorType: input.actorType,
    actorName: input.actorName || (input.actorType === 'AI_AGENT' ? 'FixProof AI Agent' : input.actorType),
    details: input.details || `Executed ${input.eventType}`,
    metadata: input.metadata || {},
    success: input.success !== undefined ? input.success : true,
    correlationId: input.correlationId || `req_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
  };

  // Prepend to audit store
  auditLogStore.unshift(eventRecord);

  // Print clean server-side log
  console.log(`📋 [AUDIT LOG] [${eventRecord.actorType}] ${eventRecord.eventType}: ${eventRecord.details} (${eventRecord.correlationId})`);

  return eventRecord;
}

/**
 * Retrieve chronological audit trail for a specific issue.
 */
export async function getAuditTrailForIssue(issueId: string): Promise<AuditEventRecord[]> {
  return auditLogStore.filter(
    (e) => e.issueId === issueId || (e.metadata && e.metadata.issueId === issueId)
  );
}

/**
 * Retrieve audit trail for a work order.
 */
export async function getAuditTrailForWorkOrder(workOrderId: string): Promise<AuditEventRecord[]> {
  return auditLogStore.filter((e) => e.workOrderId === workOrderId);
}
