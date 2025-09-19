import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { getApiKeyById } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      location, 
      productType, 
      additionalKeywords, 
      modelId, 
      apiKeyId, 
      temperature, 
      maxTokens 
    } = body

    if (!location) {
      return NextResponse.json(
        { error: '나라/도시 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    // API 키 가져오기
    const apiKey = await getApiKeyById(apiKeyId)
    if (!apiKey) {
      return NextResponse.json(
        { error: '유효하지 않은 API 키입니다.' },
        { status: 400 }
      )
    }

    // AI 서비스 초기화
    const aiService = new AIService({
      modelId,
      apiKey: apiKey.key,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 100
    })

    // 상품 제목 생성
    const titles = await generateTravelTitles(aiService, location, productType, additionalKeywords)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error('제목 생성 API 오류:', error)
    return NextResponse.json(
      { error: '제목 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

async function generateTravelTitles(
  aiService: AIService, 
  location: string, 
  productType: string, 
  additionalKeywords: string
): Promise<any[]> {
  const titles = []
  
  // SEO 최적화된 카테고리별 제목 생성
  const categories = [
    { 
      name: 'luxury', 
      prompt: '럭셔리하고 고급스러운',
      seoKeywords: ['프리미엄', '럭셔리', '고급', 'VIP', '특별']
    },
    { 
      name: 'budget', 
      prompt: '저렴하고 경제적인',
      seoKeywords: ['저렴한', '경제적', '할인', '특가', '가성비']
    },
    { 
      name: 'adventure', 
      prompt: '모험적이고 스릴있는',
      seoKeywords: ['모험', '스릴', '액티비티', '체험', '도전']
    },
    { 
      name: 'romantic', 
      prompt: '로맨틱하고 낭만적인',
      seoKeywords: ['로맨틱', '낭만', '커플', '신혼', '데이트']
    },
    { 
      name: 'family', 
      prompt: '가족 친화적이고 안전한',
      seoKeywords: ['가족', '아이', '안전', '편안한', '친화적']
    },
    { 
      name: 'cultural', 
      prompt: '문화적이고 교육적인',
      seoKeywords: ['문화', '역사', '교육', '학습', '체험']
    },
    { 
      name: 'nature', 
      prompt: '자연 친화적이고 평화로운',
      seoKeywords: ['자연', '힐링', '평화', '휴양', '그린']
    }
  ]

  for (const category of categories) {
    try {
      // SEO 최적화된 프롬프트 생성
      const seoPrompt = `다음 정보를 바탕으로 SEO에 최적화된 ${category.prompt} 여행 상품 제목을 생성해주세요.

나라/도시: ${location}
상품 유형: ${productType || '패키지 여행'}
추가 키워드: ${additionalKeywords || '없음'}
SEO 키워드: ${category.seoKeywords.join(', ')}

요구사항:
- 20-30자 내외의 길이 (SEO 최적화)
- 한국어로 작성
- ${category.prompt} 느낌을 강조
- 여행의 매력과 특별함을 표현
- 마케팅에 적합한 문구
- SEO 키워드를 자연스럽게 포함
- 클릭을 유도하는 매력적인 문구
- 검색량이 높을 것으로 예상되는 키워드 포함

제목만 반환하고 다른 설명은 포함하지 마세요.`

      const title = await aiService.generateTitle(seoPrompt)
      
      // 키워드 추출 (SEO 최적화)
      const keywords = await generateKeywords(aiService, location, productType, additionalKeywords, category.seoKeywords)
      
      titles.push({
        title: title.trim(),
        category: category.name,
        keywords: keywords.slice(0, 5) // 최대 5개 키워드
      })
    } catch (error) {
      console.error(`${category.name} 카테고리 제목 생성 오류:`, error)
      // 폴백 제목 생성
      titles.push({
        title: `${location} ${category.prompt} ${productType || '여행'}`,
        category: category.name,
        keywords: [`${location} 여행`, `${location} 관광`, `${productType || '여행'}`]
      })
    }
  }

  return titles
}

async function generateKeywords(
  aiService: AIService, 
  location: string, 
  productType: string, 
  additionalKeywords: string,
  seoKeywords: string[] = []
): Promise<string[]> {
  try {
    const prompt = `다음 정보와 관련된 SEO 최적화된 여행 키워드를 5-8개 생성해주세요.

나라/도시: ${location}
상품 유형: ${productType || '패키지 여행'}
추가 키워드: ${additionalKeywords || '없음'}
SEO 키워드: ${seoKeywords.join(', ')}

요구사항:
- 여행과 관련된 키워드
- SEO에 적합한 키워드
- 검색량이 많을 것으로 예상되는 키워드
- 한국어로 작성
- 쉼표로 구분하여 나열
- 지역명과 상품 유형을 포함한 롱테일 키워드
- 검색 의도에 맞는 키워드

키워드만 반환하고 다른 설명은 포함하지 마세요.`

    const response = await aiService.generateTitle(prompt)
    const keywords = response.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0)
    
    // 기본 키워드와 결합
    const baseKeywords = [
      `${location} 여행`,
      `${location} 관광`,
      `${productType || '여행'}`,
      `${location} 패키지`
    ]
    
    return [...new Set([...keywords, ...baseKeywords])].slice(0, 8)
  } catch (error) {
    console.error('키워드 생성 오류:', error)
    return [`${location} 여행`, `${location} 관광`, `${productType || '여행'}`, `${location} 패키지`]
  }
}
