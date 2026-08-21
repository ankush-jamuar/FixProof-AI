-- FixProof AI Initial Database Migration DDL for Neon PostgreSQL

-- Enums
CREATE TYPE issue_category AS ENUM ('plumbing', 'electrical', 'cleaning');
CREATE TYPE issue_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE work_order_status AS ENUM (
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
);
CREATE TYPE verification_result_enum AS ENUM ('PASS', 'FAIL', 'INCONCLUSIVE');

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'supervisor' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Technicians
CREATE TABLE IF NOT EXISTS technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category issue_category NOT NULL,
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  before_image_url TEXT NOT NULL,
  voice_note_url TEXT,
  ai_category issue_category,
  ai_problem TEXT,
  ai_severity issue_severity,
  ai_confidence REAL,
  ai_reasoning TEXT,
  ai_model TEXT,
  ai_model_version TEXT,
  ai_prompt_version TEXT,
  ai_latency_ms INTEGER,
  is_human_corrected BOOLEAN DEFAULT FALSE NOT NULL,
  human_corrected_category issue_category,
  status work_order_status DEFAULT 'REPORTED' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Work Orders
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id),
  category issue_category NOT NULL,
  problem TEXT NOT NULL,
  severity issue_severity NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status work_order_status DEFAULT 'ASSIGNED' NOT NULL,
  agent_logs JSONB DEFAULT '[]'::jsonb,
  after_image_url TEXT,
  technician_notes TEXT,
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Verification Results
CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  before_image_url TEXT,
  after_image_url TEXT,
  result verification_result_enum NOT NULL,
  confidence REAL NOT NULL,
  reasoning TEXT NOT NULL,
  model TEXT,
  model_version TEXT,
  latency_ms INTEGER,
  detected_issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Evaluation Cases
CREATE TABLE IF NOT EXISTS evaluation_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category issue_category,
  description TEXT,
  expected_category issue_category NOT NULL,
  expected_severity issue_severity NOT NULL,
  expected_verification_result verification_result_enum DEFAULT 'PASS' NOT NULL,
  is_adversarial BOOLEAN DEFAULT FALSE NOT NULL,
  input_image_url TEXT,
  input_text TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_run_result JSONB,
  passed BOOLEAN,
  ran_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS tech_category_idx ON technicians(category);
CREATE INDEX IF NOT EXISTS tech_available_idx ON technicians(is_available);
CREATE INDEX IF NOT EXISTS issue_status_idx ON issues(status);
CREATE INDEX IF NOT EXISTS issue_category_idx ON issues(ai_category);
CREATE INDEX IF NOT EXISTS wo_issue_idx ON work_orders(issue_id);
CREATE INDEX IF NOT EXISTS wo_tech_idx ON work_orders(technician_id);
CREATE INDEX IF NOT EXISTS wo_status_idx ON work_orders(status);
CREATE INDEX IF NOT EXISTS vr_work_order_idx ON verification_results(work_order_id);
CREATE INDEX IF NOT EXISTS vr_issue_idx ON verification_results(issue_id);
