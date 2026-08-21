export type IssueCategory = 'plumbing' | 'electrical' | 'cleaning';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type WorkOrderStatus =
  | 'REPORTED'
  | 'ANALYZING'
  | 'PENDING_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REOPENED'
  | 'ESCALATED'
  | 'CLOSED';

export type VerificationResultEnum = 'PASS' | 'FAIL' | 'INCONCLUSIVE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'supervisor' | 'technician' | 'admin';
  created_at: string;
}

export interface Technician {
  id: string;
  name: string;
  category: IssueCategory;
  is_available: boolean;
  phone?: string;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  location: string;
  before_image_url: string;
  voice_note_url?: string;
  
  // AI Perception results
  ai_category?: IssueCategory;
  ai_problem?: string;
  ai_severity?: IssueSeverity;
  ai_confidence?: number;
  ai_reasoning?: string;
  is_human_corrected?: boolean;
  human_corrected_category?: IssueCategory;

  status: WorkOrderStatus;
  created_at: string;
  updated_at: string;
}

export interface AgentLogEntry {
  timestamp: string;
  step: string;
  action: string;
  details: string;
  toolUsed?: string;
  result?: any;
}

export interface WorkOrder {
  id: string;
  issue_id: string;
  technician_id?: string;
  category: IssueCategory;
  problem: string;
  severity: IssueSeverity;
  location: string;
  description: string;
  status: WorkOrderStatus;
  agent_logs?: AgentLogEntry[];
  after_image_url?: string;
  technician_notes?: string;
  created_at: string;
  updated_at: string;

  // Joined relations
  issue?: Issue;
  technician?: Technician;
}

export interface VerificationRecord {
  id: string;
  work_order_id: string;
  issue_id: string;
  result: VerificationResultEnum;
  confidence: number;
  reasoning: string;
  detected_issues?: string[];
  created_at: string;
}

export interface EvaluationCaseRecord {
  id: string;
  name: string;
  category_target: IssueCategory;
  expected_outcome: string;
  is_adversarial: boolean;
  input_image_url?: string;
  input_text: string;
  last_run_result?: Record<string, any>;
  passed?: boolean;
  ran_at?: string;
}
