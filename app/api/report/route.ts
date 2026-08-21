import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/storage/cloudinary';
import { createIssue } from '@/lib/db/queries';
import { IssueReportFormSchema, validateImageFile } from '@/lib/validation/schemas';
import { sanitizeServerError, AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const description = formData.get('description') as string;
    const location = formData.get('location') as string;
    const file = formData.get('file') as File | null;

    // 1. Validate text fields with Zod
    const textValidation = IssueReportFormSchema.safeParse({ description, location });
    if (!textValidation.success) {
      const errorMsg = textValidation.error.issues.map((e: any) => e.message).join(' ');
      throw new AppError('VALIDATION_ERROR', errorMsg, 400);
    }

    // 2. Validate image file
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid || !file) {
      throw new AppError('VALIDATION_ERROR', fileValidation.error || 'Invalid file provided.', 400);
    }

    // 3. Convert file to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Cloudinary (or local fallback if credentials missing)
    const uploadResult = await uploadImageToCloudinary(buffer, 'fixproof_evidence');

    // 5. Save Issue in Neon PostgreSQL with status = REPORTED
    const createdIssue = await createIssue({
      description,
      location,
      beforeImageUrl: uploadResult.url,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Issue reported successfully.',
        issue: createdIssue,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/report');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: safeError.code,
          message: safeError.message,
        },
      },
      { status: safeError.statusCode }
    );
  }
}
