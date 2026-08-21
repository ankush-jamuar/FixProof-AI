import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/storage/cloudinary';
import { createIssue } from '@/lib/db/queries';
import { IssueReportFormSchema, validateImageFile } from '@/lib/validation/schemas';

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
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    // 2. Validate image file
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid || !file) {
      return NextResponse.json(
        { success: false, error: fileValidation.error || 'Invalid file provided.' },
        { status: 400 }
      );
    }

    // 3. Convert file to Buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload to Cloudinary (or local fallback if credentials missing)
    let uploadResult;
    try {
      uploadResult = await uploadImageToCloudinary(buffer, 'fixproof_evidence');
    } catch (uploadErr: any) {
      console.error('Cloudinary upload error in /api/report:', uploadErr);
      return NextResponse.json(
        { success: false, error: 'Failed to store image evidence. Please try again.' },
        { status: 500 }
      );
    }

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
  } catch (error: any) {
    console.error('Unexpected error in /api/report:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
