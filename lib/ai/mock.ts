import { ZodSchema } from 'zod';
import { AIProvider, MultimodalInput, AIProviderResponse } from './provider';

export class MockAIProvider implements AIProvider {
  public name = 'Mock AI Provider (Deterministic Test Harness)';
  private mockData: any;
  private delayMs: number;

  constructor(mockData?: any, delayMs = 150) {
    this.mockData = mockData || {
      category: 'plumbing',
      problem: 'Visible pipe joint leak with active water accumulation',
      severity: 'medium',
      confidence: 0.92,
      reasoning: 'Evidence photograph clearly displays water escaping from lower pipe joint near room wall.',
    };
    this.delayMs = delayMs;
  }

  async generateStructuredJSON<T>(
    input: MultimodalInput,
    schema: ZodSchema<T>,
    _temperature = 0.1
  ): Promise<AIProviderResponse<T>> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    const validatedData = schema.parse(this.mockData);

    return {
      data: validatedData,
      rawResponseText: JSON.stringify(this.mockData),
      modelName: 'mock-gemini-2.5-flash',
      modelVersion: 'v1-mock',
      latencyMs: this.delayMs,
    };
  }
}
