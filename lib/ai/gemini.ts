import { GoogleGenAI } from '@google/genai';
import { ZodSchema } from 'zod';
import { AIProvider, MultimodalInput, AIProviderResponse } from './provider';
import { AppError } from '@/lib/errors';

export class GeminiProvider implements AIProvider {
  public name = 'Google Gemini API Provider';
  private modelName: string;

  constructor(modelName?: string) {
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async generateStructuredJSON<T>(
    input: MultimodalInput,
    schema: ZodSchema<T>,
    temperature = 0.1
  ): Promise<AIProviderResponse<T>> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new AppError(
        'AI_CONFIGURATION_ERROR',
        'AI analysis is temporarily unavailable.',
        503,
        'GEMINI_API_KEY environment variable is not configured.'
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const startTime = Date.now();

    const contents: any[] = [];

    // Attach BEFORE image if buffer is provided
    if (input.imageBuffer) {
      contents.push({ text: 'BEFORE REPAIR EVIDENCE PHOTOGRAPH:' });
      contents.push({
        inlineData: {
          data: input.imageBuffer.toString('base64'),
          mimeType: input.mimeType || 'image/jpeg',
        },
      });
    }

    // Attach AFTER image if buffer is provided
    if (input.afterImageBuffer) {
      contents.push({ text: 'AFTER REPAIR EVIDENCE PHOTOGRAPH SUBMITTED BY TECHNICIAN:' });
      contents.push({
        inlineData: {
          data: input.afterImageBuffer.toString('base64'),
          mimeType: input.mimeType || 'image/jpeg',
        },
      });
    }

    // Attach text prompt
    contents.push({ text: input.textPrompt });

    try {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents,
        config: {
          systemInstruction: input.systemInstruction,
          responseMimeType: 'application/json',
          temperature,
        },
      });

      const latencyMs = Date.now() - startTime;
      const rawText = response.text || '{}';

      // Parse JSON
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch (jsonErr) {
        throw new AppError(
          'AI_INVALID_RESPONSE',
          'AI returned an unusable result. Please try again.',
          502,
          `Failed to parse Gemini JSON output: ${rawText}`
        );
      }

      // Validate with Zod schema
      const validatedData = schema.parse(parsedJson);

      return {
        data: validatedData,
        rawResponseText: rawText,
        modelName: this.modelName,
        modelVersion: 'gemini-2.5-flash',
        latencyMs,
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }

      const errMsg = err?.message || String(err);
      if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('400')) {
        throw new AppError(
          'AI_CONFIGURATION_ERROR',
          'AI analysis is temporarily unavailable.',
          503,
          `Gemini API Auth Error: ${errMsg}`
        );
      }

      throw new AppError(
        'AI_ANALYSIS_FAILED',
        'AI analysis failed. Please try again.',
        500,
        `Gemini Provider error: ${errMsg}`
      );
    }
  }
}
