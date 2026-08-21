export type ErrorCode =
  | 'AI_CONFIGURATION_ERROR'
  | 'AI_ANALYSIS_FAILED'
  | 'AI_TIMEOUT'
  | 'AI_INVALID_RESPONSE'
  | 'ISSUE_NOT_FOUND'
  | 'DATABASE_ERROR'
  | 'STORAGE_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface SafeErrorResponse {
  code: ErrorCode;
  message: string;
  statusCode: number;
}

export class AppError extends Error {
  public code: ErrorCode;
  public userMessage: string;
  public statusCode: number;

  constructor(code: ErrorCode, userMessage: string, statusCode = 500, internalMessage?: string) {
    super(internalMessage || userMessage);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
  }
}

/**
 * Utility to sanitize any server-side exception into a safe, client-facing response.
 * Detailed diagnostic info is logged to server-side console ONLY.
 */
export function sanitizeServerError(error: unknown, context = 'Server'): SafeErrorResponse {
  const rawErrorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Sanitized Server Log (hides API keys & secret URLs)
  const safeLogMessage = rawErrorMessage
    .replace(/key=[A-Za-z0-9_-]+/gi, 'key=REDACTED')
    .replace(/AI_KEY=[A-Za-z0-9_-]+/gi, 'AI_KEY=REDACTED')
    .replace(/postgres:\/\/[^@]+@/gi, 'postgres://REDACTED@');

  console.error(`🔴 [SERVER ERROR] [${context}]:`, {
    message: safeLogMessage,
    stack: errorStack ? safeLogMessage : undefined,
  });

  // Handle known AppError instances
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.userMessage,
      statusCode: error.statusCode,
    };
  }

  // Detect Gemini API Key or Auth configuration issues
  if (
    rawErrorMessage.includes('API key not valid') ||
    rawErrorMessage.includes('API_KEY_INVALID') ||
    rawErrorMessage.includes('GEMINI_API_KEY is not configured') ||
    rawErrorMessage.includes('UNAUTHENTICATED')
  ) {
    return {
      code: 'AI_CONFIGURATION_ERROR',
      message: 'AI analysis is temporarily unavailable.',
      statusCode: 503,
    };
  }

  // Detect Timeouts
  if (rawErrorMessage.includes('timeout') || rawErrorMessage.includes('ETIMEDOUT') || rawErrorMessage.includes('abort')) {
    return {
      code: 'AI_TIMEOUT',
      message: 'AI analysis timed out. Please try again.',
      statusCode: 504,
    };
  }

  // Detect Malformed JSON / Zod Schema Validation Failure
  if (rawErrorMessage.includes('JSON') || rawErrorMessage.includes('ZodError') || rawErrorMessage.includes('schema')) {
    return {
      code: 'AI_INVALID_RESPONSE',
      message: 'AI returned an unusable result. Please try again.',
      statusCode: 502,
    };
  }

  // Default fallback for general AI or internal provider errors
  return {
    code: 'AI_ANALYSIS_FAILED',
    message: 'AI analysis failed. Please try again.',
    statusCode: 500,
  };
}
