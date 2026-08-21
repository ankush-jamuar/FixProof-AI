import { NextResponse } from 'next/server';
import { EVALUATION_CASES } from '@/lib/evaluation/cases';
import { sanitizeServerError } from '@/lib/errors';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      totalCases: EVALUATION_CASES.length,
      cases: EVALUATION_CASES,
    });
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/evaluation');
    return NextResponse.json(
      {
        success: false,
        error: { code: safeError.code, message: safeError.message },
      },
      { status: safeError.statusCode }
    );
  }
}
