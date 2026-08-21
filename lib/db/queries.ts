import { db } from './index';
import * as schema from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { IssueCategory, IssueSeverity, WorkOrderStatus } from '@/types/domain';

// In-memory fallback cache for local dev mode when Neon DATABASE_URL is not yet connected
const memoryIssuesStore: any[] = [];
const memoryTechniciansStore: any[] = [
  { id: 'tech-1', name: 'Rajesh Kumar (Lead Plumber)', category: 'plumbing', isAvailable: true, phone: '+1-555-0101', createdAt: new Date() },
  { id: 'tech-2', name: 'Sarah Jenkins (Master Electrician)', category: 'electrical', isAvailable: true, phone: '+1-555-0201', createdAt: new Date() },
  { id: 'tech-3', name: 'Amina Idris (Sanitation Supervisor)', category: 'cleaning', isAvailable: true, phone: '+1-555-0301', createdAt: new Date() },
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

export async function getAllIssues() {
  if (!isDatabaseConfigured()) {
    return memoryIssuesStore;
  }
  try {
    return await db.select().from(schema.issues).orderBy(desc(schema.issues.createdAt));
  } catch (err) {
    console.warn('⚠️ Neon DB query failed, using memory fallback:', err);
    return memoryIssuesStore;
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

export async function getAllWorkOrders() {
  if (!isDatabaseConfigured()) {
    return [];
  }
  try {
    return await db.select().from(schema.workOrders).orderBy(desc(schema.workOrders.createdAt));
  } catch (err) {
    return [];
  }
}

export async function getWorkOrderById(id: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }
  try {
    const results = await db.select().from(schema.workOrders).where(eq(schema.workOrders.id, id));
    return results[0] || null;
  } catch (err) {
    return null;
  }
}
