import { NextResponse } from 'next/server';
import { runFullEvaluationSuite } from '@/lib/evaluation/runner';
import { sanitizeServerError } from '@/lib/errors';

export async function POST() {
  try {
    const suiteSummary = await runFullEvaluationSuite();
    return NextResponse.json(suiteSummary, { status: 200 });
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/evaluation/run');
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
