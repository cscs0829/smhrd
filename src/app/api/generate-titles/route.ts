import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/ai-service'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('요청 데이터:', body)
    
    const { 
      location, 
      productType, 
      additionalKeywords, 
      titleCount,
      modelId, 
      apiKeyId, 
      temperature, 
      maxTokens,
      excludeTitles = []
    } = body

    console.log('파싱된 데이터:', {
      location,
      productType,
      additionalKeywords,
      titleCount,
      modelId,
      apiKeyId,
      temperature,
      maxTokens
    })

    if (!location) {
      console.log('오류: location이 없음')
      return NextResponse.json(
        { error: '나라/도시 정보가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!apiKeyId) {
      console.log('오류: apiKeyId가 없음')
      return NextResponse.json(
        { error: 'API 키 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // API 키 가져오기 (직접 데이터베이스에서 조회)
    console.log('API 키 조회 중...', apiKeyId)
    const supabase = getSupabase()
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', apiKeyId)
      .eq('is_active', true)
      .single()
    
    console.log('API 키 조회 결과:', apiKeyData ? '성공' : '실패', apiKeyError)
    
    if (apiKeyError || !apiKeyData) {
      return NextResponse.json(
        { error: '유효하지 않은 API 키입니다.' },
        { status: 400 }
      )
    }

    // AI 서비스 초기화
    const aiService = new AIService({
      modelId,
      apiKey: apiKeyData.api_key,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 100
    })

    // 상품 제목 생성
    const titles = await generateTravelTitles(aiService, location, productType, additionalKeywords, titleCount || 5, excludeTitles)

    return NextResponse.json({ titles })
  } catch (error) {
    console.error('제목 생성 API 오류:', error)
    return NextResponse.json(
      { error: '제목 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

interface GeneratedTitle {
  title: string
  category: string
  keywords: string[]
}

async function generateTravelTitles(
  aiService: AIService, 
  location: string, 
  productType: string, 
  additionalKeywords: string,
  titleCount: number = 5,
  excludeTitles: string[] = []
): Promise<GeneratedTitle[]> {
  const titles: GeneratedTitle[] = []
  
  // SEO 최적화된 카테고리별 제목 생성
  const categories = [
    { 
      name: 'luxury', 
      prompt: '럭셔리하고 고급스러운',
      seoKeywords: ['프리미엄', '럭셔리', '고급', 'VIP', '특별', '엘리트', '독점']
    },
    { 
      name: 'value', 
      prompt: '합리적이고 가치 있는',
      seoKeywords: ['합리적', '가성비', '스마트', '효율적', '최적화', '선택']
    },
    { 
      name: 'adventure', 
      prompt: '모험적이고 스릴있는',
      seoKeywords: ['모험', '스릴', '액티비티', '체험', '도전', '역동적']
    },
    { 
      name: 'romantic', 
      prompt: '로맨틱하고 낭만적인',
      seoKeywords: ['로맨틱', '낭만', '커플', '신혼', '데이트', '특별한']
    },
    { 
      name: 'family', 
      prompt: '가족 친화적이고 안전한',
      seoKeywords: ['가족', '안전', '편안한', '친화적', '포용적', '따뜻한']
    },
    { 
      name: 'cultural', 
      prompt: '문화적이고 교육적인',
      seoKeywords: ['문화', '역사', '교육', '학습', '체험', '탐구']
    },
    { 
      name: 'nature', 
      prompt: '자연 친화적이고 평화로운',
      seoKeywords: ['자연', '힐링', '평화', '휴양', '그린', '순수']
    }
  ]

  // titleCount에 맞게 제목 생성 (중복 방지 로직 포함)
  let attempts = 0
  const maxAttempts = titleCount * 3 // 최대 시도 횟수
  
  while (titles.length < titleCount && attempts < maxAttempts) {
    const category = categories[titles.length % categories.length] // 카테고리를 순환
    
    try {
      // SEO 최적화된 프롬프트 생성 (중복 방지를 위한 추가 지침 포함)
      const excludeInstruction = excludeTitles.length > 0 
        ? `\n- 다음 제목들과 유사하거나 중복되지 않도록 주의하세요: ${excludeTitles.join(', ')}`
        : ''
      
      const seoPrompt = `다음 정보를 바탕으로 SEO에 최적화된 ${category.prompt} 여행 상품 제목을 생성해주세요.

나라/도시: ${location}
상품 유형: ${productType || '패키지 여행'}
추가 키워드: ${additionalKeywords || '없음'}
SEO 키워드: ${category.seoKeywords.join(' ')}${excludeInstruction}

요구사항:
- 35-50자 내외의 길이로 작성 (SEO 최적화)
- 최소 12개 이상의 키워드로 구성
- 한국어로 작성
- ${category.prompt} 느낌을 강조
- 네이버 가격 비교 상위 노출 스타일로 작성
- 다음 요소들을 모두 포함: 지역명, 여행기간, 계절/월, 도시명, 여행유형, 특별활동, 추가키워드
- 핵심 키워드 중심으로 구성하되 불필요한 수식어 사용 금지
- 명사 중심의 키워드 나열 방식
- 고급스럽고 품격 있는 문구 사용
- 브랜드 가치를 높이는 프리미엄 이미지 강조
- 이모지나 기호 사용 완전 금지 (쉼표, 콜론, 따옴표, 느낌표, 물음표 등 모든 기호 사용 금지)
- 실질 형태소(명사, 형용사)만 사용하여 자연스러운 문장 구성
- 금지 단어: 특가, 땡처리, 반값, 무료, 횡재, 인하, 폭탄, 저가, 저렴한 등
- 기존에 생성된 제목들과 중복되지 않도록 창의적이고 독창적인 제목을 작성하세요
- 예시: "홋카이도 일본 3박4일 오타루 10월 추석연휴 삿포로 하나투어 노쇼핑투어 북해도 골프여행"
- 영어 사용 금지

제목만 반환하고 다른 설명은 포함하지 마세요.`

      const title = await aiService.generateTitle(seoPrompt)
      // 기호 제거 및 정리
      let cleanedTitle = title
        .trim()
        .replace(/[",:;.!?()[\]{}'"]/g, '') // 모든 기호 제거
        .replace(/\s+/g, ' ') // 연속된 공백을 하나로
        .trim()
      
      // 불필요한 수식어 제거
      const unnecessaryWords = [
        '넘치는', '가득한', '풍부한', '화려한', '넘치는', '가득한', '풍부한', '화려한',
        '만끽하는', '즐기는', '경험하는', '체험하는', '감상하는', '즐기는',
        '특별한', '독특한', '유니크한', '특별한', '독특한', '유니크한', "합리적", "가치", "역동적" 
      ]
      
      unnecessaryWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g')
        cleanedTitle = cleanedTitle.replace(regex, '')
      })
      
      // 다시 공백 정리
      cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim()
      
      // 중복 검사: 이미 생성된 제목들과 제외할 제목들과 비교
      const isDuplicate = titles.some(t => t.title === cleanedTitle) || 
                         excludeTitles.includes(cleanedTitle)
      
      if (!isDuplicate) {
        // 키워드 추출 (SEO 최적화)
        const keywords = await generateKeywords(aiService, location, productType, additionalKeywords, category.seoKeywords)
        
        titles.push({
          title: cleanedTitle,
          category: category.name,
          keywords: keywords.slice(0, 5) // 최대 5개 키워드
        })
      } else {
        console.log(`중복 제목 감지됨: ${cleanedTitle}`)
      }
      
    } catch (error) {
      console.error(`${category.name} 카테고리 제목 생성 오류:`, error)
      // 폴백 제목 생성 (중복 검사 포함)
      const fallbackTitle = `${location} ${category.prompt} ${productType || '여행'} ${Date.now()}`
      const isDuplicate = titles.some(t => t.title === fallbackTitle) || 
                         excludeTitles.includes(fallbackTitle)
      
      if (!isDuplicate) {
        titles.push({
          title: fallbackTitle,
          category: category.name,
          keywords: [`${location} 여행`, `${location} 관광`, `${productType || '여행'}`]
        })
      }
    }
    
    attempts++
  }
  
  console.log(`제목 생성 완료: ${titles.length}개 생성 (시도 횟수: ${attempts})`)

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
SEO 키워드: ${seoKeywords.join(' ')}

요구사항:
- 여행과 관련된 키워드
- SEO에 적합한 키워드
- 검색량이 많을 것으로 예상되는 키워드
- 한국어로 작성
- 쉼표로 구분하여 나열
- 지역명과 상품 유형을 포함한 롱테일 키워드
- 검색 의도에 맞는 키워드
- 기호 사용 금지 (실질 형태소만 사용)
- 브랜드 가치를 훼손하는 단어 사용 금지

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
