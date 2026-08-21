import { NextRequest, NextResponse } from 'next/server';
import { getIssueById, updateIssuePerception } from '@/lib/db/queries';
import { analyzeIssuePerception } from '@/lib/ai/perception';
import { GeminiProvider } from '@/lib/ai/gemini';
import { MockAIProvider } from '@/lib/ai/mock';
import { sanitizeServerError, AppError } from '@/lib/errors';
import { logAuditEvent } from '@/lib/audit/logger';

export async function POST(request: NextRequest) {
  const correlationId = `req_${Date.now().toString(36)}`;

  try {
    const body = await request.json();
    const { issueId } = body;

    if (!issueId || typeof issueId !== 'string') {
      throw new AppError('VALIDATION_ERROR', 'Invalid request parameters.', 400);
    }

    // 1. Fetch Issue from Neon database
    const issue = await getIssueById(issueId);

    if (!issue) {
      throw new AppError('ISSUE_NOT_FOUND', 'Issue not found.', 404);
    }

    if (!issue.beforeImageUrl) {
      throw new AppError('VALIDATION_ERROR', 'Issue record is missing primary evidence photo.', 400);
    }

    await logAuditEvent({
      issueId: issue.id,
      eventType: 'AI_ANALYSIS_STARTED',
      previousStatus: issue.status,
      actorType: 'AI_AGENT',
      details: 'Started multimodal perception analysis on issue evidence.',
      correlationId,
    });

    // 2. Fetch/convert image to Buffer safely
    let imageBuffer: Buffer | undefined;
    try {
      if (issue.beforeImageUrl.startsWith('data:image')) {
        const base64Data = issue.beforeImageUrl.split(',')[1];
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        const imageRes = await fetch(issue.beforeImageUrl);
        if (imageRes.ok) {
          const arrayBuf = await imageRes.arrayBuffer();
          imageBuffer = Buffer.from(arrayBuf);
        }
      }
    } catch (imgErr) {
      console.warn('⚠️ Server-side warning: could not fetch image buffer from URL:', imgErr);
    }

    // 3. Select AI Provider
    const provider = process.env.GEMINI_API_KEY
      ? new GeminiProvider()
      : new MockAIProvider();

    // 4. Run Multimodal Perception
    const analysisResult = await analyzeIssuePerception({
      imageBuffer,
      description: issue.description,
      location: issue.location,
      provider,
    });

    const { perception, isHighConfidence, modelName, promptVersion, latencyMs } = analysisResult;

    // 5. Save validated perception output to Neon database
    const updatedIssue = await updateIssuePerception(issue.id, {
      aiCategory: perception.category,
      aiProblem: perception.problem,
      aiSeverity: perception.severity,
      aiConfidence: perception.confidence,
      aiReasoning: perception.reasoning,
      aiModel: modelName,
      aiPromptVersion: promptVersion,
      aiLatencyMs: latencyMs,
      isHighConfidence,
    });

    const nextStatus = isHighConfidence ? 'ANALYZING' : 'PENDING_REVIEW';

    await logAuditEvent({
      issueId: issue.id,
      eventType: 'AI_ANALYSIS_COMPLETED',
      previousStatus: issue.status,
      newStatus: nextStatus,
      actorType: 'AI_AGENT',
      details: `Perception identified ${perception.category.toUpperCase()} (${perception.severity.toUpperCase()}) with ${(perception.confidence * 100).toFixed(0)}% confidence in ${latencyMs}ms.`,
      metadata: {
        category: perception.category,
        severity: perception.severity,
        confidence: perception.confidence,
        modelName,
        promptVersion,
        latencyMs,
      },
      correlationId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'AI perception analysis completed successfully.',
        issue: updatedIssue,
        perception,
        isHighConfidence,
        telemetry: {
          modelName,
          promptVersion,
          latencyMs,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safeError = sanitizeServerError(error, '/api/analyze');
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
