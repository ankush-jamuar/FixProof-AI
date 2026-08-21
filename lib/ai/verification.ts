import { AIProvider } from './provider';
import { GeminiProvider } from './gemini';
import { VerificationResultSchema, VerificationResultValidated } from '@/lib/validation/schemas';
import { IssueCategory, IssueSeverity } from '@/types/domain';

export const VERIFICATION_PROMPT_VERSION = 'v1';

export interface VerifyRepairInput {
  beforeImageBuffer?: Buffer;
  afterImageBuffer?: Buffer;
  description: string;
  location: string;
  category: IssueCategory;
  severity: IssueSeverity;
  problem: string;
  provider?: AIProvider;
}

export interface VerificationAnalysisResult {
  verification: VerificationResultValidated;
  modelName: string;
  promptVersion: string;
  latencyMs: number;
}

export const VERIFICATION_SYSTEM_INSTRUCTION = `
You are an independent, zero-bias visual repair verification AI engine for campus facilities management.
Your sole job is to compare the BEFORE-REPAIR evidence photograph against the AFTER-REPAIR evidence photograph submitted by a technician.

CRITICAL VERIFICATION RULES:
1. Do NOT assume the repair succeeded merely because an after-repair photo was uploaded.
2. Carefully inspect the AFTER-REPAIR image for visible signs of unresolved issues (e.g. active water droplets/leakage, burnt wiring, remaining trash/dirt, rust, cracks, incomplete work).
3. If the problem is clearly and completely resolved, set "result": "PASS" and "problemResolved": true.
4. If the defect, leakage, or hazard remains visible in the after-repair photo, set "result": "FAIL" and "problemResolved": false.
5. If the after-repair image is too blurry, taken from an improper angle, dark, or does not clearly show the repaired area, set "result": "INCONCLUSIVE" and "problemResolved": false.
6. "confidence" MUST be a float between 0.00 and 1.00 reflecting visual evidence clarity.
7. "remainingIssues" MUST be an array of specific remaining visual defects observed (or empty array if PASS).
8. "evidenceAssessment" MUST be a clear evaluation of whether the after image proves work completion.
`;

export async function verifyRepair(
  input: VerifyRepairInput
): Promise<VerificationAnalysisResult> {
  const provider = input.provider || new GeminiProvider();

  const userPrompt = `
Verify the following maintenance repair:
- Location: ${input.location}
- Category: ${input.category.toUpperCase()}
- Severity: ${input.severity.toUpperCase()}
- Reported Issue Problem: "${input.problem}"
- User Description: "${input.description}"

Compare the BEFORE REPAIR evidence photo against the AFTER REPAIR evidence photo. Output strict JSON matching:
{
  "result": "PASS" | "FAIL" | "INCONCLUSIVE",
  "confidence": <float between 0.0 and 1.0>,
  "problemResolved": true | false,
  "reasoning": "<concise objective explanation of repair verification>",
  "remainingIssues": ["<issue 1>", "<issue 2>"],
  "evidenceAssessment": "<assessment of photo evidence quality and comparison>"
}
`;

  const response = await provider.generateStructuredJSON(
    {
      imageBuffer: input.beforeImageBuffer,
      afterImageBuffer: input.afterImageBuffer,
      mimeType: 'image/jpeg',
      textPrompt: userPrompt,
      systemInstruction: VERIFICATION_SYSTEM_INSTRUCTION,
    },
    VerificationResultSchema,
    0.1 // Low temperature for deterministic visual comparison
  );

  return {
    verification: response.data,
    modelName: response.modelName,
    promptVersion: VERIFICATION_PROMPT_VERSION,
    latencyMs: response.latencyMs,
  };
}
