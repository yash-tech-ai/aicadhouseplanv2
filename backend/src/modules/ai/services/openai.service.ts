import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private enabled: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.enabled = !!apiKey && apiKey !== 'your-openai-api-key';

    if (this.enabled) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateSuggestions(prompt: string): Promise<string> {
    if (!this.enabled) {
      return 'OpenAI is not configured. Please add OPENAI_API_KEY to .env file.';
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert architect assistant specializing in residential and commercial building plans in India. Provide practical, regulation-compliant suggestions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || 'No suggestion generated';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return 'Failed to generate AI suggestions';
    }
  }

  async analyzeDrawing(parameters: any): Promise<string> {
    const prompt = `
Analyze this building plan and provide optimization suggestions:

Parameters:
${JSON.stringify(parameters, null, 2)}

Please provide:
1. Compliance check with Indian building codes
2. Space optimization suggestions
3. Ventilation and natural light recommendations
4. Cost-efficiency improvements
5. Popular layout alternatives

Keep suggestions practical and specific to Indian context.
    `;

    return this.generateSuggestions(prompt);
  }
}
