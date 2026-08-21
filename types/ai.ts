import { IssueCategory, IssueSeverity, VerificationResultEnum } from './domain';

export interface PerceptionResult {
  category: IssueCategory;
  problem: string;
  severity: IssueSeverity;
  confidence: number;
  location_extracted?: string;
  reason: string;
}

export interface VerificationResult {
  result: VerificationResultEnum;
  confidence: number;
  reason: string;
  detected_issues?: string[];
}

export interface ToolCallRecommendation {
  toolName: string;
  parameters: Record<string, any>;
  reasoning: string;
}

export interface AgentDecision {
  thought: string;
  recommendation: ToolCallRecommendation;
}
