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
  
  // 네이버 가격비교 최적화 SEO 키워드 (실제 상위 노출 제목 분석 기반)
  const naverSeoKeywords = [
    // 지역/국가 키워드
    '일본', '중국', '유럽', '동남아', '태국', '베트남', '필리핀', '싱가포르', '말레이시아',
    '스페인', '프랑스', '이탈리아', '독일', '영국', '스위스', '오스트리아', '체코', '헝가리',
    '터키', '그리스', '포르투갈', '네덜란드', '벨기에', '덴마크', '스웨덴', '노르웨이', '핀란드',
    '러시아', '몽골', '인도', '인도네시아', '캄보디아', '라오스', '미얀마', '방글라데시',
    '호주', '뉴질랜드', '미국', '캐나다', '멕시코', '브라질', '아르헨티나', '칠레', '페루',
    // 도시/지역 키워드  
    '도쿄', '오사카', '교토', '삿포로', '홋카이도', '북해도', '오타루', '하코다테',
    '베이징', '상하이', '홍콩', '마카오', '대만', '타이페이',
    '마드리드', '바르셀로나', '세비야', '그라나다', '파리', '니스', '칸', '마르세유',
    '로마', '밀라노', '베네치아', '피렌체', '나폴리', '베를린', '뮌헨', '함부르크',
    '런던', '에든버러', '더블린', '암스테르담', '로테르담', '브뤼셀', '빈', '잘츠부르크',
    '취리히', '제네바', '모스크바', '상트페테르부르크', '이스탄불', '앙카라', '아테네', '산토리니',
    // 여행 기간 키워드
    '2박3일', '3박4일', '4박5일', '5박6일', '6박7일', '7박8일',
    // 계절/월 키워드
    '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월',
    '겨울', '봄', '여름', '가을', '추석연휴', '신정연휴', '여름휴가', '겨울휴가',
    // 여행 유형 키워드
    '패키지여행', '자유여행', '골프여행', '신혼여행', '가족여행', '커플여행', '솔로여행',
    '단체여행', '개별여행', '맞춤여행', '프리미엄여행', '럭셔리여행',
    // 특별 활동 키워드
    '노쇼핑투어', '온천', '크루즈', '눈꽃축제', '벚꽃축제', '불꽃축제', '축제',
    '골프', '스키', '스노보드', '다이빙', '스쿠버다이빙', '스노클링', '패러세일링',
    // 브랜드/업체 키워드 제거 (저작권 문제 방지)
    // 추가 키워드
    '해외여행', '국내여행', '여행', '관광', '투어', '여행상품', '여행패키지',
    '항공', '호텔', '리조트', '펜션', '게스트하우스', '에어비앤비'
  ]

  // titleCount에 맞게 제목 생성 (중복 방지 로직 포함)
  let attempts = 0
  const maxAttempts = titleCount * 3 // 최대 시도 횟수
  
  while (titles.length < titleCount && attempts < maxAttempts) {
    try {
      // SEO 최적화된 프롬프트 생성 (중복 방지를 위한 추가 지침 포함)
      const excludeInstruction = excludeTitles.length > 0 
        ? `\n- 다음 제목들과 유사하거나 중복되지 않도록 주의하세요: ${excludeTitles.join(', ')}`
        : ''
      
      const seoPrompt = `다음 정보를 바탕으로 네이버 가격비교 상위 노출을 위한 SEO 최적화 여행 상품 제목을 생성해주세요.

**중요**: 입력된 지역 "${location}"과 관련된 키워드만 사용하세요. 다른 국가나 지역의 키워드는 절대 사용하지 마세요.

나라/도시: ${location}
상품 유형: ${productType || '패키지 여행'}
추가 키워드: ${additionalKeywords || '없음'}
SEO 키워드 풀: ${naverSeoKeywords.join(' ')}${excludeInstruction}

네이버 가격비교 해외여행 상위 노출 전략:
1. **핵심 키워드 우선 배치**: 지역명을 제목 앞쪽에 배치
2. **다양한 연관 키워드 자연스럽게 포함**: 최소 12개 이상의 키워드로 구성
3. **정확한 상품 속성 정보 포함**: 여행기간, 계절/월, 도시명, 여행유형, 특별활동
4. **실제 검색 트렌드 반영**: 사용자가 자주 검색하는 키워드 중심
5. **여행사명 사용 금지**: 저작권 문제 방지를 위해 특정 여행사명 사용 금지
6. **지역별 특화 키워드 활용**: 해당 지역의 대표 도시, 관광지, 문화, 음식, 축제 등 포함

요구사항:
- 35-50자 내외의 길이로 작성 (네이버 가격비교 최적화)
- 최소 12개 이상의 키워드로 구성 (실제 검색량 높은 키워드 우선)
- 한국어로만 작성
- 네이버 가격비교 실제 상위 노출 제목 스타일 적용
- 필수 포함 요소: 지역명, 국가명, 여행기간, 계절/월, 도시명, 여행유형, 특별활동
- 명사 중심의 키워드 나열 방식 (연결어 최소화)
- 고급스럽고 품격 있는 브랜드 이미지 유지
- 이모지나 기호 사용 완전 금지 (쉼표, 콜론, 따옴표, 느낌표, 물음표 등 모든 기호 사용 금지)
- 실질 형태소(명사, 형용사)만 사용하여 자연스러운 문장 구성
- 금지 단어: 특가, 땡처리, 반값, 무료, 횡재, 인하, 폭탄, 저가, 저렴한 등
- 여행사명 사용 금지: 하나투어, 모두투어, 여행박사, 마이리얼트립, 트리플원투어, 트래블로버, 투어맨 등
- 기존에 생성된 제목들과 중복되지 않도록 창의적이고 독창적인 제목을 작성하세요
- 실제 네이버 가격비교 상위 노출 제목 스타일: "홋카이도 일본 3박4일 홋카이도 10월 추석연휴 삿포로 노쇼핑투어 북해도 골프여행"
- 새로운 지역(예: 스페인, 파타야, 하코다테, 기타큐슈, 히로시마등)의 경우 해당 지역의 대표 도시 및 지역, 문화, 음식, 축제, 관광지를 포함한 키워드 활용
- **지역 일관성 유지**: 입력된 지역과 관련 없는 다른 국가/도시 키워드 혼합 금지 (예: 하코다테 입력 시 베이징, 파리 등 다른 국가 도시 사용 금지)
- **논리적 키워드 조합**: 해당 지역과 지리적으로, 문화적으로 관련된 키워드만 사용
- **여행 키워드 중복 방지**: "여행"으로 끝나는 키워드는 제목에 하나만 포함 (예: 가족여행, 미식여행, 온천여행, 패키지여행등 하나만 선택)
등
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
        // 키워드 추출 (네이버 가격비교 최적화)
        const keywords = await generateKeywords(aiService, location, productType, additionalKeywords, naverSeoKeywords)
        
        titles.push({
          title: cleanedTitle,
          category: 'travel', // 통합 카테고리
          keywords: keywords.slice(0, 5) // 최대 5개 키워드
        })
      } else {
        console.log(`중복 제목 감지됨: ${cleanedTitle}`)
      }
      
    } catch (error) {
      console.error('제목 생성 오류:', error)
      // 폴백 제목 생성 (중복 검사 포함)
      const fallbackTitle = `${location} 여행 ${productType || '패키지'} ${Date.now()}`
      const isDuplicate = titles.some(t => t.title === fallbackTitle) || 
                         excludeTitles.includes(fallbackTitle)
      
      if (!isDuplicate) {
        titles.push({
          title: fallbackTitle,
          category: 'travel',
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
  naverSeoKeywords: string[] = []
): Promise<string[]> {
  try {
    const prompt = `다음 정보와 관련된 네이버 가격비교 최적화 여행 키워드를 5-8개 생성해주세요.

**중요**: 입력된 지역 "${location}"과 관련된 키워드만 사용하세요. 다른 국가나 지역의 키워드는 절대 사용하지 마세요.

나라/도시: ${location}
상품 유형: ${productType || '패키지 여행'}
추가 키워드: ${additionalKeywords || '없음'}
네이버 SEO 키워드 풀: ${naverSeoKeywords.join(' ')}

네이버 가격비교 키워드 생성 요구사항:
- 실제 검색량이 높은 여행 관련 키워드
- 네이버 가격비교에서 자주 검색되는 키워드
- 지역명과 여행 유형을 포함한 롱테일 키워드
- 계절성, 특별활동, 브랜드 등을 포함한 키워드
- 해당 지역의 대표 도시, 문화, 음식, 축제, 관광지 키워드 포함
- **지역 일관성 필수**: 입력된 지역과 관련된 키워드만 사용, 다른 국가/지역 키워드 혼합 금지
- **여행 키워드 중복 방지**: "여행"으로 끝나는 키워드는 하나만 포함 (가족여행, 미식여행, 온천여행, 패키지여행등 하나만 선택)
- 한국어로만 작성
- 쉼표로 구분하여 나열
- 검색 의도에 맞는 실용적인 키워드
- 기호 사용 금지 (실질 형태소만 사용)
- 브랜드 가치를 훼손하는 단어 사용 금지
- 예시: "홋카이도여행", "일본3박4일", "삿포로골프", "겨울눈꽃축제", "패키지여행"
- 스페인 예시: "스페인여행", "바르셀로나3박4일", "마드리드플라멩고", "세비야축제", "스페인골프" (여행 키워드는 하나만)
- 여행사명 사용 금지: 하나투어, 모두투어, 여행박사, 마이리얼트립 등

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
