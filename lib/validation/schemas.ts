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
