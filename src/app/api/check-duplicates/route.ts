import { NextRequest, NextResponse } from 'next/server'
import { 
  checkMultipleTitleDuplicates, 
  categorizeBySimilarity,
  type DuplicateCheckResult 
} from '@/lib/text-similarity'
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
    const { titles, threshold = 0.8 } = body
    
    console.log('중복 검사 요청:', { titlesCount: titles?.length, threshold })
    
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json(
        { error: '검사할 제목들이 필요합니다.' },
        { status: 400 }
      )
    }
    
    // EP 데이터베이스에서 기존 제목들 가져오기
    const supabase = getSupabase()
    
    // 활성 EP 데이터에서 제목들 가져오기
    const { data: epTitles, error: epError } = await supabase
      .from('ep_data')
      .select('title, id, created_at')
      .not('title', 'is', null)
      .not('title', 'eq', '')
      .limit(2000) // 성능을 위해 제한
      .order('created_at', { ascending: false })
    
    if (epError) {
      console.error('EP 제목 조회 오류:', epError)
      return NextResponse.json(
        { error: '기존 제목을 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
    
    // 삭제된 EP 데이터에서도 제목들 가져오기
    let deletedTitles: any[] = []
    try {
      const { data: deletedData, error: deletedError } = await supabase
        .from('deleted_ep_data')
        .select('title, id, deleted_at')
        .not('title', 'is', null)
        .not('title', 'eq', '')
        .limit(1000)
        .order('deleted_at', { ascending: false })
      
      if (!deletedError && deletedData) {
        deletedTitles = deletedData
      }
    } catch (error) {
      console.log('삭제된 EP 데이터 테이블이 없거나 접근할 수 없습니다:', error)
    }
    
    // 모든 기존 제목을 하나의 배열로 합치기
    const existingTitles = [
      ...(epTitles || []).map(item => ({
        title: item.title,
        id: item.id,
        type: 'active' as const,
        date: item.created_at
      })),
      ...deletedTitles.map(item => ({
        title: item.title,
        id: item.id,
        type: 'deleted' as const,
        date: item.deleted_at
      }))
    ]
    
    console.log(`총 ${existingTitles.length}개의 기존 제목과 비교합니다. (활성: ${epTitles?.length || 0}, 삭제됨: ${deletedTitles.length})`)
    
    // 중복 검사 실행
    const duplicateResults = checkMultipleTitleDuplicates(titles, existingTitles, threshold)
    
    // 결과 정리 및 통계
    const results: {
      [title: string]: {
        duplicates: DuplicateCheckResult[]
        categories: ReturnType<typeof categorizeBySimilarity>
        summary: {
          total: number
          exact: number
          high: number
          medium: number
          low: number
        }
      }
    } = {}
    
    let totalDuplicates = 0
    let totalExact = 0
    let totalHigh = 0
    let totalMedium = 0
    let totalLow = 0
    
    for (const [title, duplicates] of duplicateResults) {
      const categories = categorizeBySimilarity(duplicates)
      
      results[title] = {
        duplicates,
        categories,
        summary: {
          total: duplicates.length,
          exact: categories.exact.length,
          high: categories.high.length,
          medium: categories.medium.length,
          low: categories.low.length
        }
      }
      
      totalDuplicates += duplicates.length
      totalExact += categories.exact.length
      totalHigh += categories.high.length
      totalMedium += categories.medium.length
      totalLow += categories.low.length
    }
    
    // 전체 통계
    const overallStats = {
      checkedTitles: titles.length,
      titlesWithDuplicates: duplicateResults.size,
      totalDuplicateMatches: totalDuplicates,
      breakdown: {
        exact: totalExact,
        high: totalHigh,
        medium: totalMedium,
        low: totalLow
      },
      threshold,
      existingTitlesCount: existingTitles.length
    }
    
    console.log('중복 검사 완료:', overallStats)
    
    return NextResponse.json({
      results,
      stats: overallStats,
      success: true
    })
    
  } catch (error) {
    console.error('중복 검사 API 오류:', error)
    return NextResponse.json(
      { error: '중복 검사 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
