import { 
  pgTable, 
  pgEnum, 
  uuid, 
  text, 
  boolean, 
  timestamp, 
  real, 
  integer, 
  jsonb, 
  index 
} from 'drizzle-orm/pg-core';

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------

export const issueCategoryEnum = pgEnum('issue_category', [
  'plumbing',
  'electrical',
  'cleaning'
]);

export const severityEnum = pgEnum('issue_severity', [
  'low',
  'medium',
  'high',
  'critical'
]);

export const workOrderStatusEnum = pgEnum('work_order_status', [
  'REPORTED',
  'ANALYZING',
  'PENDING_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REOPENED',
  'ESCALATED',
  'CLOSED'
]);

export const verificationResultEnum = pgEnum('verification_result_enum', [
  'PASS',
  'FAIL',
  'INCONCLUSIVE'
]);

// ----------------------------------------------------
// TABLES
// ----------------------------------------------------

// Users / Supervisors
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').default('supervisor').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Technicians
export const technicians = pgTable('technicians', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: issueCategoryEnum('category').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('tech_category_idx').on(table.category),
  index('tech_available_idx').on(table.isAvailable)
]);

// Issues (Original customer/campus user report + perception)
export const issues = pgTable('issues', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location').notNull(),
  beforeImageUrl: text('before_image_url').notNull(),
  voiceNoteUrl: text('voice_note_url'),

  // AI Perception Metadata
  aiCategory: issueCategoryEnum('ai_category'),
  aiProblem: text('ai_problem'),
  aiSeverity: severityEnum('ai_severity'),
  aiConfidence: real('ai_confidence'),
  aiReasoning: text('ai_reasoning'),
  aiModel: text('ai_model'),
  aiModelVersion: text('ai_model_version'),
  aiPromptVersion: text('ai_prompt_version'),
  aiLatencyMs: integer('ai_latency_ms'),

  // Human Correction override
  isHumanCorrected: boolean('is_human_corrected').default(false).notNull(),
  humanCorrectedCategory: issueCategoryEnum('human_corrected_category'),

  status: workOrderStatusEnum('status').default('REPORTED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('issue_status_idx').on(table.status),
  index('issue_category_idx').on(table.aiCategory)
]);

// Work Orders
export const workOrders = pgTable('work_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
  technicianId: uuid('technician_id').references(() => technicians.id),
  category: issueCategoryEnum('category').notNull(),
  problem: text('problem').notNull(),
  severity: severityEnum('severity').notNull(),
  location: text('location').notNull(),
  description: text('description').notNull(),
  status: workOrderStatusEnum('status').default('ASSIGNED').notNull(),
  agentLogs: jsonb('agent_logs').default([]),
  afterImageUrl: text('after_image_url'),
  technicianNotes: text('technician_notes'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('wo_issue_idx').on(table.issueId),
  index('wo_tech_idx').on(table.technicianId),
  index('wo_status_idx').on(table.status)
]);

// Verification Results (2nd Stage visual comparison engine)
export const verificationResults = pgTable('verification_results', {
  id: uuid('id').defaultRandom().primaryKey(),
  workOrderId: uuid('work_order_id').references(() => workOrders.id, { onDelete: 'cascade' }).notNull(),
  issueId: uuid('issue_id').references(() => issues.id, { onDelete: 'cascade' }).notNull(),
  beforeImageUrl: text('before_image_url'),
  afterImageUrl: text('after_image_url'),
  result: verificationResultEnum('result').notNull(),
  confidence: real('confidence').notNull(),
  reasoning: text('reasoning').notNull(),
  model: text('model'),
  modelVersion: text('model_version'),
  latencyMs: integer('latency_ms'),
  detectedIssues: jsonb('detected_issues').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('vr_work_order_idx').on(table.workOrderId),
  index('vr_issue_idx').on(table.issueId)
]);

// Evaluation Cases (Benchmark test runner)
export const evaluationCases = pgTable('evaluation_cases', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  category: issueCategoryEnum('category'),
  description: text('description'),
  expectedCategory: issueCategoryEnum('expected_category').notNull(),
  expectedSeverity: severityEnum('expected_severity').notNull(),
  expectedVerificationResult: verificationResultEnum('expected_verification_result').default('PASS').notNull(),
  isAdversarial: boolean('is_adversarial').default(false).notNull(),
  inputImageUrl: text('input_image_url'),
  inputText: text('input_text'),
  metadata: jsonb('metadata').default({}),
  lastRunResult: jsonb('last_run_result'),
  passed: boolean('passed'),
  ranAt: timestamp('ran_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
