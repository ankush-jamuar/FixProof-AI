import { z } from 'zod';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/gif'
];

export const IssueReportFormSchema = z.object({
  description: z
    .string()
    .min(5, { message: 'Description must be at least 5 characters long.' })
    .max(2000, { message: 'Description cannot exceed 2000 characters.' }),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long.' })
    .max(200, { message: 'Location cannot exceed 200 characters.' }),
});

export function validateImageFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'An evidence photo is required.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image size exceeds the 10 MB limit.' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Allowed types: JPEG, PNG, WEBP, HEIC, GIF.',
    };
  }

  return { valid: true };
}

// ----------------------------------------------------
// AI PERCEPTION SCHEMA
// ----------------------------------------------------
export const PerceptionResultSchema = z.object({
  category: z.enum(['plumbing', 'electrical', 'cleaning']),
  problem: z
    .string()
    .min(3, { message: 'Problem description must be at least 3 characters.' })
    .max(500, { message: 'Problem description cannot exceed 500 characters.' }),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  confidence: z
    .number()
    .min(0, { message: 'Confidence score cannot be below 0.' })
    .max(1, { message: 'Confidence score cannot exceed 1.' }),
  reasoning: z
    .string()
    .min(5, { message: 'Reasoning must be at least 5 characters.' })
    .max(1000, { message: 'Reasoning cannot exceed 1000 characters.' }),
});

export type PerceptionResultValidated = z.infer<typeof PerceptionResultSchema>;

// ----------------------------------------------------
// AI VERIFICATION SCHEMA (2ND STAGE INDEPENDENT MODEL)
// ----------------------------------------------------
export const VerificationResultSchema = z.object({
  result: z.enum(['PASS', 'FAIL', 'INCONCLUSIVE']),
  confidence: z
    .number()
    .min(0, { message: 'Confidence score must be between 0 and 1.' })
    .max(1, { message: 'Confidence score must be between 0 and 1.' }),
  problemResolved: z.boolean(),
  reasoning: z
    .string()
    .min(5, { message: 'Reasoning explanation must be at least 5 characters.' })
    .max(1000, { message: 'Reasoning explanation cannot exceed 1000 characters.' }),
  remainingIssues: z.array(z.string()).default([]),
  evidenceAssessment: z
    .string()
    .min(5, { message: 'Evidence assessment must be at least 5 characters.' })
    .max(1000, { message: 'Evidence assessment cannot exceed 1000 characters.' }),
});

export type VerificationResultValidated = z.infer<typeof VerificationResultSchema>;
