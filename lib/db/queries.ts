import { db } from './index';
import * as schema from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { IssueCategory } from '@/types/domain';

export async function getAllTechnicians() {
  return await db.select().from(schema.technicians).orderBy(schema.technicians.name);
}

export async function getAvailableTechniciansByCategory(category: IssueCategory) {
  return await db
    .select()
    .from(schema.technicians)
    .where(
      and(
        eq(schema.technicians.category, category),
        eq(schema.technicians.isAvailable, true)
      )
    );
}

export async function getAllIssues() {
  return await db.select().from(schema.issues).orderBy(desc(schema.issues.createdAt));
}

export async function getIssueById(id: string) {
  const results = await db.select().from(schema.issues).where(eq(schema.issues.id, id));
  return results[0] || null;
}

export async function getAllWorkOrders() {
  return await db.select().from(schema.workOrders).orderBy(desc(schema.workOrders.createdAt));
}

export async function getWorkOrderById(id: string) {
  const results = await db.select().from(schema.workOrders).where(eq(schema.workOrders.id, id));
  return results[0] || null;
}
