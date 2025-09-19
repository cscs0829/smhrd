import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase'

const ALLOWED_TABLES = ['ep_data', 'city_images', 'titles', 'api_keys', 'deleted_items']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 테이블입니다.' 
      }, { status: 400 })
    }

    const supabase = table === 'api_keys' || table === 'deleted_items' 
      ? getSupabaseAdmin() 
      : getSupabaseClient()

    let query = supabase.from(table).select('*')

    // 검색 필터 적용
    if (search) {
      const searchColumns = getSearchColumns(table)
      const searchConditions = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',')
      query = query.or(searchConditions)
    }

    // 정렬 적용
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // 페이지네이션 적용
    const from = page * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error(`테이블 ${table} 데이터 조회 오류:`, error)
      return NextResponse.json({ 
        success: false, 
        error: '데이터를 불러오는데 실패했습니다.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error: unknown) {
    console.error('테이블 데이터 조회 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 테이블입니다.' 
      }, { status: 400 })
    }

    const body = await request.json()
    const supabase = table === 'api_keys' || table === 'deleted_items' 
      ? getSupabaseAdmin() 
      : getSupabaseClient()

    // 현재 시간 추가
    const now = new Date().toISOString()
    const dataToInsert = {
      ...body,
      created_at: now,
      updated_at: now
    }

    const { data, error } = await supabase
      .from(table)
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error(`테이블 ${table} 데이터 생성 오류:`, error)
      return NextResponse.json({ 
        success: false, 
        error: '데이터 생성에 실패했습니다.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: '데이터가 성공적으로 생성되었습니다.'
    })

  } catch (error: unknown) {
    console.error('테이블 데이터 생성 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 테이블입니다.' 
      }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID가 필요합니다.' 
      }, { status: 400 })
    }

    const body = await request.json()
    const supabase = table === 'api_keys' || table === 'deleted_items' 
      ? getSupabaseAdmin() 
      : getSupabaseClient()

    // 현재 시간으로 업데이트
    const dataToUpdate = {
      ...body,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from(table)
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`테이블 ${table} 데이터 수정 오류:`, error)
      return NextResponse.json({ 
        success: false, 
        error: '데이터 수정에 실패했습니다.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: '데이터가 성공적으로 수정되었습니다.'
    })

  } catch (error: unknown) {
    console.error('테이블 데이터 수정 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 테이블입니다.' 
      }, { status: 400 })
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID가 필요합니다.' 
      }, { status: 400 })
    }

    const supabase = table === 'api_keys' || table === 'deleted_items' 
      ? getSupabaseAdmin() 
      : getSupabaseClient()

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`테이블 ${table} 데이터 삭제 오류:`, error)
      return NextResponse.json({ 
        success: false, 
        error: '데이터 삭제에 실패했습니다.' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: '데이터가 성공적으로 삭제되었습니다.'
    })

  } catch (error: unknown) {
    console.error('테이블 데이터 삭제 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 })
  }
}

// 테이블별 검색 가능한 컬럼 정의
function getSearchColumns(table: string): string[] {
  const searchColumns: Record<string, string[]> = {
    ep_data: ['title', 'brand', 'maker', 'city', 'category_name1', 'category_name2'],
    city_images: ['city', 'image_link'],
    titles: ['title', 'city'],
    api_keys: ['name', 'provider'],
    deleted_items: ['reason']
  }
  
  return searchColumns[table] || []
}
