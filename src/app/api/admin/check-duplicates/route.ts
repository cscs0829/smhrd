import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json()

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: '제목을 입력해주세요' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // EP 데이터 테이블에서 검색 (대소문자 구분 없이)
    const { data: epData, error: epError } = await supabase
      .from('ep_data')
      .select('id, title')
      .ilike('title', `%${title}%`)
      .single()

    // 삭제 테이블에서 검색 (대소문자 구분 없이)
    const { data: deleteData, error: deleteError } = await supabase
      .from('delete')
      .select('product_id, title')
      .ilike('title', `%${title}%`)
      .single()

    // 에러 처리 (데이터가 없을 때는 에러가 아님)
    if (epError && epError.code !== 'PGRST116') {
      console.error('EP 데이터 검색 오류:', epError)
    }
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('삭제 데이터 검색 오류:', deleteError)
    }

    const result = {
      title,
      foundInEpData: !!epData,
      foundInDelete: !!deleteData,
      epDataId: epData?.id || null,
      deleteId: deleteData?.product_id || null
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('중복 검색 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
