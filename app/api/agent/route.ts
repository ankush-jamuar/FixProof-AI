import { NextRequest, NextResponse } from 'next/server';
import { runAgentOrchestrator } from '@/lib/agent/orchestrator';
import { sanitizeServerError, AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, supervisorOverrideCategory, supervisorOverrideSeverity } = body;

    if (!issueId || typeof issueId !== 'string') {
      throw new AppError('VALIDATION_ERROR', 'Invalid or missing issueId parameter.', 400);
    }

    const result = await runAgentOrchestrator({
      issueId,
      supervisorOverrideCategory,
      supervisorOverrideSeverity,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.reasoning,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/agent');
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
