import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIServiceConfig {
  modelId: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  private config: AIServiceConfig;
  private openai?: OpenAI;
  private gemini?: GoogleGenerativeAI;

  constructor(config: AIServiceConfig) {
    this.config = config;

    if (config.modelId.startsWith('gpt-') || config.modelId.startsWith('o1-')) {
      this.openai = new OpenAI({
        apiKey: config.apiKey,
      });
    } else if (config.modelId.startsWith('gemini-')) {
      this.gemini = new GoogleGenerativeAI(config.apiKey);
    }
  }

  async generateTitle(prompt: string): Promise<string> {
    try {
      if (this.openai && (this.config.modelId.startsWith('gpt-') || this.config.modelId.startsWith('o1-'))) {
        return await this.generateWithOpenAI(prompt);
      } else if (this.gemini && this.config.modelId.startsWith('gemini-')) {
        return await this.generateWithGemini(prompt);
      } else {
        throw new Error('지원하지 않는 모델입니다.');
      }
    } catch (error) {
      console.error('AI 제목 생성 오류:', error);
      // 폴백 제목 생성
      return '특별한 여행 상품';
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다.');

    const response = await this.openai.chat.completions.create({
      model: this.config.modelId,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: this.config.temperature || 0.7,
      max_tokens: this.config.maxTokens || 100,
    });

    return response.choices[0]?.message?.content?.trim() || '제목 생성 실패';
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    if (!this.gemini) throw new Error('Gemini 클라이언트가 초기화되지 않았습니다.');

    const model = this.gemini.getGenerativeModel({ model: this.config.modelId });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim() || '제목 생성 실패';
  }
}
