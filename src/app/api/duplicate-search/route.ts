import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { searchTerm } = await request.json()

    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json(
        { success: false, error: '검색어를 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // EP 데이터에서 검색
    const { data: epData, error: epError } = await supabase
      .from('ep_data')
      .select('id, title, city, created_at')
      .or(`title.ilike.%${searchTerm}%,title.ilike.${searchTerm}%`)
      .limit(50)

    if (epError) {
      console.error('EP 데이터 검색 오류:', epError)
    }

    // 삭제된 항목에서 검색 (original_data JSONB에서 검색)
    const { data: deletedData, error: deletedError } = await supabase
      .from('deleted_items')
      .select('id, original_id, original_data, created_at')
      .or(`original_data->>title.ilike.%${searchTerm}%,original_data->>title.ilike.${searchTerm}%`)
      .limit(50)

    if (deletedError) {
      console.error('삭제된 항목 검색 오류:', deletedError)
    }

    // 결과를 통합하고 일치 유형 분류
    const results: Array<{
      id: string
      title: string
      city: string
      type: 'ep_data' | 'deleted_items'
      created_at: string
      match_type: 'exact' | 'partial'
    }> = []

    // EP 데이터 결과 처리
    if (epData) {
      epData.forEach(item => {
        const isExactMatch = item.title.toLowerCase() === searchTerm.toLowerCase()
        const isPartialMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase())
        
        results.push({
          id: item.id,
          title: item.title,
          city: item.city || '알 수 없음',
          type: 'ep_data',
          created_at: item.created_at,
          match_type: isExactMatch ? 'exact' : (isPartialMatch ? 'partial' : 'partial')
        })
      })
    }

    // 삭제된 항목 결과 처리
    if (deletedData) {
      deletedData.forEach(item => {
        const originalData = item.original_data as { title?: string; city?: string }
        const title = originalData?.title || ''
        const city = originalData?.city || '알 수 없음'
        
        const isExactMatch = title.toLowerCase() === searchTerm.toLowerCase()
        const isPartialMatch = title.toLowerCase().includes(searchTerm.toLowerCase())
        
        results.push({
          id: item.original_id, // original_id 사용
          title: title,
          city: city,
          type: 'deleted_items',
          created_at: item.created_at,
          match_type: isExactMatch ? 'exact' : (isPartialMatch ? 'partial' : 'partial')
        })
      })
    }

    // 정확히 일치하는 항목을 먼저, 그 다음 부분 일치 항목을 정렬
    results.sort((a, b) => {
      if (a.match_type === 'exact' && b.match_type !== 'exact') return -1
      if (a.match_type !== 'exact' && b.match_type === 'exact') return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      epDataCount: epData?.length || 0,
      deletedDataCount: deletedData?.length || 0
    })

  } catch (error) {
    console.error('중복 검색 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '검색 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
