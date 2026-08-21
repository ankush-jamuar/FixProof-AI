import { db } from './index';
import * as schema from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { IssueCategory, IssueSeverity, WorkOrderStatus, VerificationResult } from '@/types/domain';

// In-memory fallback cache for local dev mode when Neon DATABASE_URL is not yet connected
const memoryIssuesStore: any[] = [];
const memoryWorkOrdersStore: any[] = [];
const memoryVerificationStore: any[] = [];
const memoryTechniciansStore: any[] = [
  { id: 'tech-1', name: 'Rajesh Kumar (Lead Plumber)', category: 'plumbing', isAvailable: true, phone: '+1-555-0101', createdAt: new Date() },
  { id: 'tech-2', name: 'Carlos Mendez (Plumbing Specialist)', category: 'plumbing', isAvailable: true, phone: '+1-555-0102', createdAt: new Date() },
  { id: 'tech-3', name: 'David Chen (Pipe & Drainage Tech)', category: 'plumbing', isAvailable: false, phone: '+1-555-0103', createdAt: new Date() },
  { id: 'tech-4', name: 'Sarah Jenkins (Master Electrician)', category: 'electrical', isAvailable: true, phone: '+1-555-0201', createdAt: new Date() },
  { id: 'tech-5', name: 'Marcus Vance (High-Voltage Tech)', category: 'electrical', isAvailable: true, phone: '+1-555-0202', createdAt: new Date() },
  { id: 'tech-6', name: 'Elena Rostova (Lighting & Wiring Tech)', category: 'electrical', isAvailable: false, phone: '+1-555-0203', createdAt: new Date() },
  { id: 'tech-7', name: 'Amina Idris (Sanitation Supervisor)', category: 'cleaning', isAvailable: true, phone: '+1-555-0301', createdAt: new Date() },
  { id: 'tech-8', name: 'Liam O\'Connor (Hazmat & Deep Clean Tech)', category: 'cleaning', isAvailable: true, phone: '+1-555-0302', createdAt: new Date() },
  { id: 'tech-9', name: 'Priya Sharma (Facilities Cleaner)', category: 'cleaning', isAvailable: false, phone: '+1-555-0303', createdAt: new Date() },
];

function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes('placeholder'));
}

export async function getAllTechnicians() {
  if (!isDatabaseConfigured()) {
    return memoryTechniciansStore;
  }
  try {
    return await db.select().from(schema.technicians).orderBy(schema.technicians.name);
  } catch (err) {
    console.warn('⚠️ Neon DB query failed, using in-memory technician store fallback:', err);
    return memoryTechniciansStore;
  }
}

export async function getTechnicianById(id: string) {
  if (!isDatabaseConfigured()) {
    return memoryTechniciansStore.find(t => t.id === id) || null;
  }
  try {
    const results = await db.select().from(schema.technicians).where(eq(schema.technicians.id, id));
    return results[0] || memoryTechniciansStore.find(t => t.id === id) || null;
  } catch (err) {
    return memoryTechniciansStore.find(t => t.id === id) || null;
  }
}

export async function getAvailableTechniciansByCategory(category: IssueCategory) {
  if (!isDatabaseConfigured()) {
    return memoryTechniciansStore.filter(t => t.category === category && t.isAvailable);
  }
  try {
    return await db
      .select()
      .from(schema.technicians)
      .where(
        and(
          eq(schema.technicians.category, category),
          eq(schema.technicians.isAvailable, true)
        )
      );
  } catch (err) {
    console.warn('⚠️ Neon DB query failed, using fallback:', err);
    return memoryTechniciansStore.filter(t => t.category === category && t.isAvailable);
  }
}

export async function createIssue(data: {
  description: string;
  location: string;
  beforeImageUrl: string;
  title?: string;
}) {
  const generatedTitle = data.title || (data.description.length > 50 ? `${data.description.slice(0, 50)}...` : data.description);

  if (!isDatabaseConfigured()) {
    console.warn('⚠️ DATABASE_URL not configured. Saving issue to memory cache fallback.');
    const mockIssue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: generatedTitle,
      description: data.description,
      location: data.location,
      beforeImageUrl: data.beforeImageUrl,
      voiceNoteUrl: null,
      aiCategory: null,
      aiProblem: null,
      aiSeverity: null,
      aiConfidence: null,
      aiReasoning: null,
      aiModel: null,
      aiModelVersion: null,
      aiPromptVersion: null,
      aiLatencyMs: null,
      isHumanCorrected: false,
      humanCorrectedCategory: null,
      status: 'REPORTED' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryIssuesStore.unshift(mockIssue);
    return mockIssue;
  }

  try {
    const [inserted] = await db
      .insert(schema.issues)
      .values({
        title: generatedTitle,
        description: data.description,
        location: data.location,
        beforeImageUrl: data.beforeImageUrl,
        status: 'REPORTED',
      })
      .returning();

    return inserted;
  } catch (err) {
    console.error('Failed to create issue in Neon DB:', err);
    throw err;
  }
}

export async function updateIssuePerception(
  issueId: string,
  perceptionData: {
    aiCategory: IssueCategory;
    aiProblem: string;
    aiSeverity: IssueSeverity;
    aiConfidence: number;
    aiReasoning: string;
    aiModel: string;
    aiPromptVersion: string;
    aiLatencyMs: number;
    isHighConfidence: boolean;
  }
) {
  const nextStatus: WorkOrderStatus = perceptionData.isHighConfidence ? 'ANALYZING' : 'PENDING_REVIEW';

  if (!isDatabaseConfigured()) {
    const item = memoryIssuesStore.find(i => i.id === issueId);
    if (item) {
      item.aiCategory = perceptionData.aiCategory;
      item.aiProblem = perceptionData.aiProblem;
      item.aiSeverity = perceptionData.aiSeverity;
      item.aiConfidence = perceptionData.aiConfidence;
      item.aiReasoning = perceptionData.aiReasoning;
      item.aiModel = perceptionData.aiModel;
      item.aiPromptVersion = perceptionData.aiPromptVersion;
      item.aiLatencyMs = perceptionData.aiLatencyMs;
      item.status = nextStatus;
      item.updatedAt = new Date();
      return item;
    }
    return null;
  }

  try {
    const [updated] = await db
      .update(schema.issues)
      .set({
        aiCategory: perceptionData.aiCategory,
        aiProblem: perceptionData.aiProblem,
        aiSeverity: perceptionData.aiSeverity,
        aiConfidence: perceptionData.aiConfidence,
        aiReasoning: perceptionData.aiReasoning,
        aiModel: perceptionData.aiModel,
        aiPromptVersion: perceptionData.aiPromptVersion,
        aiLatencyMs: perceptionData.aiLatencyMs,
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.issues.id, issueId))
      .returning();

    return updated;
  } catch (err) {
    console.error(`Failed to update issue perception for issue ${issueId}:`, err);
    throw err;
  }
}

export async function updateIssueStatus(issueId: string, status: WorkOrderStatus) {
  if (!isDatabaseConfigured()) {
    const item = memoryIssuesStore.find(i => i.id === issueId);
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
      return item;
    }
    return null;
  }
  try {
    const [updated] = await db
      .update(schema.issues)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.issues.id, issueId))
      .returning();
    return updated;
  } catch (err) {
    console.error(`Failed to update issue status for issue ${issueId}:`, err);
    throw err;
  }
}

export async function getAllIssues() {
  if (!isDatabaseConfigured()) {
    return memoryIssuesStore.filter(i => !i.title?.startsWith('EVAL:'));
  }
  try {
    const results = await db.select().from(schema.issues).orderBy(desc(schema.issues.createdAt));
    return results.filter(i => !i.title?.startsWith('EVAL:'));
  } catch (err) {
    console.warn('⚠️ Neon DB query failed, using memory fallback:', err);
    return memoryIssuesStore.filter(i => !i.title?.startsWith('EVAL:'));
  }
}

export async function getIssueById(id: string) {
  if (!isDatabaseConfigured()) {
    return memoryIssuesStore.find(i => i.id === id) || null;
  }
  try {
    const results = await db.select().from(schema.issues).where(eq(schema.issues.id, id));
    return results[0] || memoryIssuesStore.find(i => i.id === id) || null;
  } catch (err) {
    console.warn('⚠️ Neon DB query failed, checking memory fallback:', err);
    return memoryIssuesStore.find(i => i.id === id) || null;
  }
}

// ----------------------------------------------------
// WORK ORDER HELPER QUERIES
// ----------------------------------------------------

export async function getWorkOrderByIssueId(issueId: string) {
  if (!isDatabaseConfigured()) {
    return memoryWorkOrdersStore.find(w => w.issueId === issueId) || null;
  }
  try {
    const results = await db.select().from(schema.workOrders).where(eq(schema.workOrders.issueId, issueId));
    return results[0] || null;
  } catch (err) {
    return memoryWorkOrdersStore.find(w => w.issueId === issueId) || null;
  }
}

export async function createWorkOrderRecord(data: {
  issueId: string;
  technicianId?: string;
  category: IssueCategory;
  problem: string;
  severity: IssueSeverity;
  location: string;
  description: string;
  agentLogs?: any[];
}) {
  const existing = await getWorkOrderByIssueId(data.issueId);
  if (existing) {
    return existing; // Idempotency check: return existing work order
  }

  const now = new Date();

  if (!isDatabaseConfigured()) {
    const mockWO = {
      id: `wo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueId: data.issueId,
      technicianId: data.technicianId || null,
      category: data.category,
      problem: data.problem,
      severity: data.severity,
      location: data.location,
      description: data.description,
      status: 'ASSIGNED' as const,
      agentLogs: data.agentLogs || [],
      afterImageUrl: null,
      technicianNotes: null,
      assignedAt: now,
      startedAt: null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    memoryWorkOrdersStore.unshift(mockWO);
    await updateIssueStatus(data.issueId, 'ASSIGNED');
    return mockWO;
  }

  try {
    const [inserted] = await db
      .insert(schema.workOrders)
      .values({
        issueId: data.issueId,
        technicianId: data.technicianId,
        category: data.category,
        problem: data.problem,
        severity: data.severity,
        location: data.location,
        description: data.description,
        status: 'ASSIGNED',
        agentLogs: data.agentLogs || [],
        assignedAt: now,
      })
      .returning();

    await updateIssueStatus(data.issueId, 'ASSIGNED');
    return inserted;
  } catch (err) {
    console.error('Failed to create work order record:', err);
    throw err;
  }
}

export async function updateWorkOrderStatusRecord(
  workOrderId: string,
  newStatus: WorkOrderStatus,
  additionalData?: {
    afterImageUrl?: string;
    technicianNotes?: string;
  }
) {
  const now = new Date();
  const updates: Record<string, any> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'IN_PROGRESS') {
    updates.startedAt = now;
  } else if (newStatus === 'PENDING_VERIFICATION') {
    updates.completedAt = now;
    if (additionalData?.afterImageUrl) updates.afterImageUrl = additionalData.afterImageUrl;
    if (additionalData?.technicianNotes) updates.technicianNotes = additionalData.technicianNotes;
  }

  if (!isDatabaseConfigured()) {
    const item = memoryWorkOrdersStore.find(w => w.id === workOrderId);
    if (item) {
      Object.assign(item, updates);
      await updateIssueStatus(item.issueId, newStatus);
      return item;
    }
    return null;
  }

  try {
    const [updatedWO] = await db
      .update(schema.workOrders)
      .set(updates)
      .where(eq(schema.workOrders.id, workOrderId))
      .returning();

    if (updatedWO) {
      await updateIssueStatus(updatedWO.issueId, newStatus);
    }
    return updatedWO;
  } catch (err) {
    console.error(`Failed to update work order ${workOrderId} status:`, err);
    throw err;
  }
}

export async function getAllWorkOrders() {
  if (!isDatabaseConfigured()) {
    return memoryWorkOrdersStore.filter(w => !w.problem?.startsWith('EVAL:'));
  }
  try {
    const results = await db.select().from(schema.workOrders).orderBy(desc(schema.workOrders.createdAt));
    return results.filter(w => !w.problem?.startsWith('EVAL:'));
  } catch (err) {
    return memoryWorkOrdersStore.filter(w => !w.problem?.startsWith('EVAL:'));
  }
}

export async function getWorkOrderById(id: string) {
  if (!isDatabaseConfigured()) {
    return memoryWorkOrdersStore.find(w => w.id === id) || null;
  }
  try {
    const results = await db.select().from(schema.workOrders).where(eq(schema.workOrders.id, id));
    return results[0] || memoryWorkOrdersStore.find(w => w.id === id) || null;
  } catch (err) {
    return memoryWorkOrdersStore.find(w => w.id === id) || null;
  }
}

export async function getWorkOrdersByTechnicianId(technicianId: string) {
  if (!isDatabaseConfigured()) {
    return memoryWorkOrdersStore.filter(w => w.technicianId === technicianId && !w.problem?.startsWith('EVAL:'));
  }
  try {
    const results = await db
      .select()
      .from(schema.workOrders)
      .where(eq(schema.workOrders.technicianId, technicianId))
      .orderBy(desc(schema.workOrders.createdAt));
    return results.filter(w => !w.problem?.startsWith('EVAL:'));
  } catch (err) {
    return memoryWorkOrdersStore.filter(w => w.technicianId === technicianId && !w.problem?.startsWith('EVAL:'));
  }
}

// ----------------------------------------------------
// VERIFICATION RESULTS QUERIES
// ----------------------------------------------------

export async function saveVerificationRecord(data: {
  workOrderId: string;
  issueId: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  result: VerificationResult;
  confidence: number;
  reasoning: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  problemResolved: boolean;
  remainingIssues: string[];
  evidenceAssessment: string;
}) {
  const detectedIssuesObject = {
    problemResolved: data.problemResolved,
    remainingIssues: data.remainingIssues,
    evidenceAssessment: data.evidenceAssessment,
    promptVersion: data.promptVersion,
  };

  if (!isDatabaseConfigured()) {
    const mockVerification = {
      id: `vr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      workOrderId: data.workOrderId,
      issueId: data.issueId,
      beforeImageUrl: data.beforeImageUrl,
      afterImageUrl: data.afterImageUrl,
      result: data.result,
      confidence: data.confidence,
      reasoning: data.reasoning,
      model: data.model,
      modelVersion: 'gemini-2.5-flash',
      latencyMs: data.latencyMs,
      detectedIssues: detectedIssuesObject,
      createdAt: new Date(),
    };
    memoryVerificationStore.unshift(mockVerification);
    return mockVerification;
  }

  try {
    const [inserted] = await db
      .insert(schema.verificationResults)
      .values({
        workOrderId: data.workOrderId,
        issueId: data.issueId,
        beforeImageUrl: data.beforeImageUrl,
        afterImageUrl: data.afterImageUrl,
        result: data.result,
        confidence: data.confidence,
        reasoning: data.reasoning,
        model: data.model,
        modelVersion: 'gemini-2.5-flash',
        latencyMs: data.latencyMs,
        detectedIssues: detectedIssuesObject,
      })
      .returning();

    return inserted;
  } catch (err) {
    console.error('Failed to save verification record in Neon DB:', err);
    throw err;
  }
}

export async function getVerificationHistoryByWorkOrderId(workOrderId: string) {
  if (!isDatabaseConfigured()) {
    return memoryVerificationStore.filter(v => v.workOrderId === workOrderId);
  }
  try {
    return await db
      .select()
      .from(schema.verificationResults)
      .where(eq(schema.verificationResults.workOrderId, workOrderId))
      .orderBy(desc(schema.verificationResults.createdAt));
  } catch (err) {
    return memoryVerificationStore.filter(v => v.workOrderId === workOrderId);
  }
}

export async function getLatestVerificationResult(workOrderId: string) {
  const history = await getVerificationHistoryByWorkOrderId(workOrderId);
  return history[0] || null;
}
