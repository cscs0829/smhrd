// AI 서비스 통합 관리

import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIModel } from './ai-models'

export interface AIServiceConfig {
  modelId: string
  apiKey: string
  temperature?: number
  maxTokens?: number
}

export class AIService {
  private config: AIServiceConfig
  private model: AIModel

  constructor(config: AIServiceConfig) {
    this.config = config
    this.model = this.getModelById(config.modelId)
    
    if (!this.model) {
      throw new Error(`Model ${config.modelId} not found`)
    }
  }

  private getModelById(modelId: string): AIModel {
    const models = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai' as const,
        version: '4.0',
        description: '최신 멀티모달 GPT-4 모델',
        maxTokens: 128000,
        costPerToken: 0.00003,
        capabilities: ['text', 'image', 'audio', 'function_calling'],
        isAvailable: true
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai' as const,
        version: '4.0',
        description: 'GPT-4o의 경량화 버전',
        maxTokens: 128000,
        costPerToken: 0.000015,
        capabilities: ['text', 'function_calling'],
        isAvailable: true
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        provider: 'openai' as const,
        version: '4.0',
        description: '고성능 GPT-4 모델',
        maxTokens: 128000,
        costPerToken: 0.00001,
        capabilities: ['text', 'function_calling'],
        isAvailable: true
      },
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'gemini' as const,
        version: '2.0',
        description: 'Google의 최신 Gemini 모델',
        maxTokens: 1000000,
        costPerToken: 0.0000075,
        capabilities: ['text', 'image', 'audio', 'video', 'function_calling'],
        isAvailable: true
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'gemini' as const,
        version: '1.5',
        description: '고성능 Gemini 모델',
        maxTokens: 2000000,
        costPerToken: 0.0000035,
        capabilities: ['text', 'image', 'audio', 'function_calling'],
        isAvailable: true
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'gemini' as const,
        version: '1.5',
        description: '빠른 응답이 필요한 작업에 최적화',
        maxTokens: 1000000,
        costPerToken: 0.00000075,
        capabilities: ['text', 'image', 'function_calling'],
        isAvailable: true
      }
    ]
    
    return models.find(m => m.id === modelId) || models[0]
  }

  async generateTitle(city: string): Promise<string> {
    try {
      const prompt = `도시: ${city}
      
SEO에 최적화된 여행 상품 제목을 생성해주세요. 다음 조건을 만족해야 합니다:
1. 한국어로 작성
2. 30-50자 내외
3. 검색에 유리한 키워드 포함
4. 매력적이고 구체적인 표현 사용
5. 여행/관광 관련 용어 포함

제목만 생성하고 다른 설명은 포함하지 마세요.`

      let response: string

      if (this.model.provider === 'openai') {
        const llm = new ChatOpenAI({
          modelName: this.model.id,
          temperature: this.config.temperature || 0.7,
          openAIApiKey: this.config.apiKey,
          maxTokens: this.config.maxTokens || 100
        })

        const result = await llm.invoke(prompt)
        response = result.content as string
      } else if (this.model.provider === 'gemini') {
        const llm = new ChatGoogleGenerativeAI({
          model: this.model.id,
          temperature: this.config.temperature || 0.7,
          apiKey: this.config.apiKey,
          maxOutputTokens: this.config.maxTokens || 100
        })

        const result = await llm.invoke(prompt)
        response = result.content as string
      } else {
        throw new Error(`Unsupported provider: ${this.model.provider}`)
      }

      return response.trim()
    } catch (error) {
      console.error('AI 제목 생성 오류:', error)
      return `${city} 특별 여행 상품`
    }
  }

  async generateMultipleTitles(city: string, count: number = 3): Promise<string[]> {
    try {
      const prompt = `도시: ${city}
      
SEO에 최적화된 여행 상품 제목을 ${count}개 생성해주세요. 다음 조건을 만족해야 합니다:
1. 한국어로 작성
2. 30-50자 내외
3. 검색에 유리한 키워드 포함
4. 매력적이고 구체적인 표현 사용
5. 여행/관광 관련 용어 포함
6. 각 제목은 서로 다른 스타일과 접근법을 사용

각 제목을 새 줄로 구분하여 생성하세요.`

      let response: string

      if (this.model.provider === 'openai') {
        const llm = new ChatOpenAI({
          modelName: this.model.id,
          temperature: this.config.temperature || 0.8,
          openAIApiKey: this.config.apiKey,
          maxTokens: this.config.maxTokens || 200
        })

        const result = await llm.invoke(prompt)
        response = result.content as string
      } else if (this.model.provider === 'gemini') {
        const llm = new ChatGoogleGenerativeAI({
          model: this.model.id,
          temperature: this.config.temperature || 0.8,
          apiKey: this.config.apiKey,
          maxOutputTokens: this.config.maxTokens || 200
        })

        const result = await llm.invoke(prompt)
        response = result.content as string
      } else {
        throw new Error(`Unsupported provider: ${this.model.provider}`)
      }

      return response
        .split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0)
        .slice(0, count)
    } catch (error) {
      console.error('AI 다중 제목 생성 오류:', error)
      return [`${city} 특별 여행 상품`, `${city} 프리미엄 여행 패키지`, `${city} 맞춤형 여행 상품`]
    }
  }

  getModelInfo(): AIModel {
    return this.model
  }

  getEstimatedCost(tokenCount: number): number {
    return this.model.costPerToken * tokenCount
  }
}

export const createAIService = (config: AIServiceConfig): AIService => {
  return new AIService(config)
}
