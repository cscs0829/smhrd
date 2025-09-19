import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.')
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '1000'
    const offset = searchParams.get('offset') || '0'
    
    console.log('EP 제목 조회 요청:', { limit, offset })
    
    const supabase = getSupabase()
    
    // EP 데이터에서 제목들을 가져오기
    const { data: epTitles, error: epError } = await supabase
      .from('ep_data')
      .select('title, id, created_at')
      .not('title', 'is', null)
      .not('title', 'eq', '')
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('created_at', { ascending: false })
    
    if (epError) {
      console.error('EP 제목 조회 오류:', epError)
      return NextResponse.json(
        { error: 'EP 제목을 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }
    
    // 삭제된 EP 데이터에서도 제목들을 가져오기 (만약 테이블이 있다면)
    let deletedTitles: any[] = []
    try {
      const { data: deletedData, error: deletedError } = await supabase
        .from('deleted_ep_data')
        .select('title, id, deleted_at')
        .not('title', 'is', null)
        .not('title', 'eq', '')
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
        .order('deleted_at', { ascending: false })
      
      if (!deletedError && deletedData) {
        deletedTitles = deletedData
      }
    } catch (error) {
      console.log('삭제된 EP 데이터 테이블이 없거나 접근할 수 없습니다:', error)
    }
    
    // 모든 제목을 하나의 배열로 합치기
    const allTitles = [
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
    
    console.log(`총 ${allTitles.length}개의 제목을 가져왔습니다. (활성: ${epTitles?.length || 0}, 삭제됨: ${deletedTitles.length})`)
    
    return NextResponse.json({
      titles: allTitles,
      total: allTitles.length,
      active: epTitles?.length || 0,
      deleted: deletedTitles.length
    })
    
  } catch (error) {
    console.error('EP 제목 조회 API 오류:', error)
    return NextResponse.json(
      { error: 'EP 제목 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
