import { GoogleGenerativeAI } from '@google/generative-ai'
import { OpenAI } from 'openai'

export interface AIServiceConfig {
  modelId: string
  apiKey: string
  temperature: number
  maxTokens: number
}

export class AIService {
  private config: AIServiceConfig
  private openai?: OpenAI
  private gemini?: GoogleGenerativeAI

  constructor(config: AIServiceConfig) {
    this.config = config
    
    // OpenAI 클라이언트 초기화
    if (config.modelId.startsWith('gpt-') || config.modelId.startsWith('o1-')) {
      this.openai = new OpenAI({
        apiKey: config.apiKey,
      })
    }
    
    // Gemini 클라이언트 초기화
    if (config.modelId.startsWith('gemini-')) {
      this.gemini = new GoogleGenerativeAI(config.apiKey)
    }
  }

  async generateTitle(prompt: string): Promise<string> {
    // 이제 prompt를 직접 받아서 처리

    try {
      if (this.openai && (this.config.modelId.startsWith('gpt-') || this.config.modelId.startsWith('o1-'))) {
        return await this.generateWithOpenAI(prompt)
      } else if (this.gemini && this.config.modelId.startsWith('gemini-')) {
        return await this.generateWithGemini(prompt)
      } else {
        throw new Error('지원하지 않는 모델입니다.')
      }
    } catch (error) {
      console.error('AI 제목 생성 오류:', error)
      // 폴백 제목 생성
      return '특별한 여행 상품'
    }
  }

  private async generateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openai) throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다.')

    const response = await this.openai.chat.completions.create({
      model: this.config.modelId,
      messages: [
        {
          role: 'system',
          content: '당신은 여행 상품 제목을 생성하는 전문가입니다. 주어진 도시에 대한 매력적이고 마케팅에 적합한 여행 상품 제목을 생성해주세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    })

    return response.choices[0]?.message?.content?.trim() || '여행 상품'
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    if (!this.gemini) throw new Error('Gemini 클라이언트가 초기화되지 않았습니다.')

    const model = this.gemini.getGenerativeModel({ 
      model: this.config.modelId,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim() || '여행 상품'
  }

  async generateDescription(city: string, productType: string): Promise<string> {
    const prompt = `다음 정보를 바탕으로 여행 상품 설명을 생성해주세요.
    도시: ${city}
    상품 유형: ${productType}
    
    요구사항:
    - 100-150자 내외의 길이
    - 한국어로 작성
    - 도시의 특징과 매력을 강조
    - 여행의 가치와 경험을 표현
    - 고객이 선택하고 싶어하는 문구
    
    설명만 반환하고 다른 내용은 포함하지 마세요.`

    try {
      if (this.openai && (this.config.modelId.startsWith('gpt-') || this.config.modelId.startsWith('o1-'))) {
        return await this.generateWithOpenAI(prompt)
      } else if (this.gemini && this.config.modelId.startsWith('gemini-')) {
        return await this.generateWithGemini(prompt)
      } else {
        throw new Error('지원하지 않는 모델입니다.')
      }
    } catch (error) {
      console.error('AI 설명 생성 오류:', error)
      return `${city}의 아름다운 풍경과 특별한 경험을 제공하는 ${productType} 상품입니다.`
    }
  }

  async generateKeywords(city: string): Promise<string[]> {
    const prompt = `다음 도시와 관련된 여행 키워드를 5-8개 생성해주세요.
    도시: ${city}
    
    요구사항:
    - 여행과 관련된 키워드
    - SEO에 적합한 키워드
    - 검색량이 많을 것으로 예상되는 키워드
    - 한국어로 작성
    - 쉼표로 구분하여 나열
    
    키워드만 반환하고 다른 설명은 포함하지 마세요.`

    try {
      let response: string
      if (this.openai && (this.config.modelId.startsWith('gpt-') || this.config.modelId.startsWith('o1-'))) {
        response = await this.generateWithOpenAI(prompt)
      } else if (this.gemini && this.config.modelId.startsWith('gemini-')) {
        response = await this.generateWithGemini(prompt)
      } else {
        throw new Error('지원하지 않는 모델입니다.')
      }

      return response.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0)
    } catch (error) {
      console.error('AI 키워드 생성 오류:', error)
      return [`${city} 여행`, `${city} 관광`, `${city} 패키지`, `${city} 투어`]
    }
  }
}
