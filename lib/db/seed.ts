import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ DATABASE_URL is not set in .env.local. Skipping database seed execution.');
  process.exit(0);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('🌱 Seeding FixProof AI database with technicians and supervisor...');

  // 1. Seed Supervisor User
  const defaultSupervisor = {
    name: 'Chief Supervisor Alex Morgan',
    email: 'supervisor@fixproof.ai',
    role: 'supervisor',
  };

  const existingSupervisor = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, defaultSupervisor.email));

  if (existingSupervisor.length === 0) {
    await db.insert(schema.users).values(defaultSupervisor);
    console.log('✅ Created default supervisor: Alex Morgan');
  }

  // 2. Seed Technicians (9 Deterministic Technicians across Plumbing, Electrical, Cleaning)
  const initialTechnicians = [
    // Plumbing
    { name: 'Rajesh Kumar (Lead Plumber)', category: 'plumbing' as const, isAvailable: true, phone: '+1-555-0101' },
    { name: 'Carlos Mendez (Plumbing Specialist)', category: 'plumbing' as const, isAvailable: true, phone: '+1-555-0102' },
    { name: 'David Chen (Pipe & Drainage Tech)', category: 'plumbing' as const, isAvailable: false, phone: '+1-555-0103' },

    // Electrical
    { name: 'Sarah Jenkins (Master Electrician)', category: 'electrical' as const, isAvailable: true, phone: '+1-555-0201' },
    { name: 'Marcus Vance (High-Voltage Tech)', category: 'electrical' as const, isAvailable: true, phone: '+1-555-0202' },
    { name: 'Elena Rostova (Lighting & Wiring Tech)', category: 'electrical' as const, isAvailable: false, phone: '+1-555-0203' },

    // Cleaning
    { name: 'Amina Idris (Sanitation Supervisor)', category: 'cleaning' as const, isAvailable: true, phone: '+1-555-0301' },
    { name: 'Liam O\'Connor (Hazmat & Deep Clean Tech)', category: 'cleaning' as const, isAvailable: true, phone: '+1-555-0302' },
    { name: 'Priya Sharma (Facilities Cleaner)', category: 'cleaning' as const, isAvailable: false, phone: '+1-555-0303' },
  ];

  for (const tech of initialTechnicians) {
    const existing = await db
      .select()
      .from(schema.technicians)
      .where(eq(schema.technicians.name, tech.name));

    if (existing.length === 0) {
      await db.insert(schema.technicians).values(tech);
      console.log(`✅ Seeded technician: ${tech.name} (${tech.category})`);
    } else {
      console.log(`ℹ️ Technician already exists: ${tech.name}`);
    }
  }

  console.log('🎉 Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
