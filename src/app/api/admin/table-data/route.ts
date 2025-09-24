import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { TABLE_NAMES, type TableName } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table') as TableName
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!table) {
      return NextResponse.json(
        { error: '테이블 이름이 필요합니다' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    const offset = (page - 1) * limit

    // 허용된 테이블 목록
    const allowedTables = Object.values(TABLE_NAMES)
    if (!allowedTables.includes(table)) {
      return NextResponse.json(
        { error: '허용되지 않은 테이블입니다' },
        { status: 400 }
      )
    }

    let query = supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)

    // 검색 조건 추가
    if (search) {
      switch (table) {
        case TABLE_NAMES.EP_DATA:
          query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%,maker.ilike.%${search}%`)
          break
        case TABLE_NAMES.DELETED_ITEMS:
          query = query.or(`original_id.ilike.%${search}%,reason.ilike.%${search}%`)
          break
        case TABLE_NAMES.API_KEYS:
          query = query.or(`name.ilike.%${search}%,provider.ilike.%${search}%`)
          break
        case TABLE_NAMES.CITY_IMAGES:
          query = query.or(`city.ilike.%${search}%`)
          break
        case TABLE_NAMES.TITLES:
          query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%`)
          break
      }
    }

    // 정렬 조건 추가
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error, count } = await query

    if (error) {
      console.error('테이블 데이터 조회 오류:', error)
      return NextResponse.json(
        { error: '데이터 조회에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error) {
    console.error('테이블 데이터 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
