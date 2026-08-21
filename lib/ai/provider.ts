import { ZodSchema } from 'zod';

export interface MultimodalInput {
  imageBuffer?: Buffer;
  afterImageBuffer?: Buffer;
  imageUrl?: string;
  afterImageUrl?: string;
  mimeType?: string;
  textPrompt: string;
  systemInstruction?: string;
}

export interface AIProviderResponse<T> {
  data: T;
  rawResponseText: string;
  modelName: string;
  modelVersion?: string;
  latencyMs: number;
}

export interface AIProvider {
  name: string;
  generateStructuredJSON<T>(
    input: MultimodalInput,
    schema: ZodSchema<T>,
    temperature?: number
  ): Promise<AIProviderResponse<T>>;
}
