import { AIProvider } from './provider';
import { GeminiProvider } from './gemini';
import { PerceptionResultSchema, PerceptionResultValidated } from '@/lib/validation/schemas';

export const PERCEPTION_PROMPT_VERSION = 'v1';
export const CONFIDENCE_THRESHOLD = 0.80;

export interface AnalyzePerceptionInput {
  imageBuffer?: Buffer;
  mimeType?: string;
  description: string;
  location: string;
  provider?: AIProvider;
}

export interface PerceptionAnalysisResult {
  perception: PerceptionResultValidated;
  isHighConfidence: boolean;
  modelName: string;
  promptVersion: string;
  latencyMs: number;
}

export const PERCEPTION_SYSTEM_INSTRUCTION = `
You are the FixProof AI Multimodal Perception Engine for campus maintenance.
Your role is to analyze visual evidence photos and complaint descriptions from campus users and output strict structured JSON.

CRITICAL SAFETY & EVIDENTIARY RULES:
1. Do NOT invent damage or facts that cannot be directly observed in the evidence photo.
2. Distinguish clearly between visible physical evidence and unverified user text claims.
3. If the image is blurry, dark, ambiguous, or irrelevant, lower the confidence score below 0.70.
4. Do NOT claim high confidence (>= 0.80) unless the problem is clearly visible and unambiguous.
5. Category MUST be strictly one of: "plumbing", "electrical", "cleaning".
6. Severity MUST be strictly one of: "low", "medium", "high", "critical".
7. Confidence MUST be a float between 0.00 and 1.00 based on evidence quality.
8. Reasoning must be a concise, objective explanation of what is visually observed.
`;

export async function analyzeIssuePerception(
  input: AnalyzePerceptionInput
): Promise<PerceptionAnalysisResult> {
  // Use provided AI provider or default to GeminiProvider
  const provider = input.provider || new GeminiProvider();

  const userPrompt = `
Analyze the following maintenance complaint:
- Location: ${input.location}
- User Description: "${input.description}"

Examine the accompanying evidence photograph and output a valid JSON object matching this schema:
{
  "category": "plumbing" | "electrical" | "cleaning",
  "problem": "<concise problem statement>",
  "severity": "low" | "medium" | "high" | "critical",
  "confidence": <float between 0.0 and 1.0>,
  "reasoning": "<evidence-based objective explanation>"
}
`;

  const response = await provider.generateStructuredJSON(
    {
      imageBuffer: input.imageBuffer,
      mimeType: input.mimeType || 'image/jpeg',
      textPrompt: userPrompt,
      systemInstruction: PERCEPTION_SYSTEM_INSTRUCTION,
    },
    PerceptionResultSchema,
    0.1 // Low temperature for deterministic analysis
  );

  const perception = response.data;
  const isHighConfidence = perception.confidence >= CONFIDENCE_THRESHOLD;

  return {
    perception,
    isHighConfidence,
    modelName: response.modelName,
    promptVersion: PERCEPTION_PROMPT_VERSION,
    latencyMs: response.latencyMs,
  };
}
