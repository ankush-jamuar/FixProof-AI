import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/drizzle/schema';

export function getCleanDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || '';
  if (!raw || raw.includes('placeholder')) return '';
  return raw.replace(/[\?&]channel_binding=[^&]+/g, '');
}

export function getDb() {
  const url = getCleanDatabaseUrl() || 'postgres://placeholder:placeholder@localhost:5432/placeholder';
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const activeDb = getDb();
    const value = (activeDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(activeDb);
    }
    return value;
  },
});
