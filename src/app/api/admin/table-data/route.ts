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
    const sortByParam = searchParams.get('sortBy') || 'created_at'
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

    // 동일한 필터/정렬을 두 번 적용해야 하므로, 빌더를 각자 구성
    // 1) total count 전용 쿼리 (head=true로 데이터 미반환)
    let countQuery = supabase.from(table).select('*', { count: 'exact', head: true })
    // 2) 데이터 조회 쿼리
    let dataQuery = supabase.from(table).select('*')

    // 검색 필터 적용 (api_keys 별도 처리)
    if (search) {
      if (table === 'api_keys') {
        const lowered = search.toLowerCase()
        const providerCandidates = ['openai', 'anthropic', 'google']
        const matchedProviders = providerCandidates.filter((p) => p === lowered)
        const conditions: string[] = []
        conditions.push(`name.ilike.%${search}%`)
        matchedProviders.forEach((p) => conditions.push(`provider.eq.${p}`))
        const orExpr = conditions.join(',')
        if (orExpr) {
          countQuery = countQuery.or(orExpr)
          dataQuery = dataQuery.or(orExpr)
        }
      } else {
        const searchColumns = getSearchColumns(table)
        const searchConditions = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',')
        if (searchConditions) {
          countQuery = countQuery.or(searchConditions)
          dataQuery = dataQuery.or(searchConditions)
        }
      }
    }

    // 정렬 적용: 테이블별 안전한 기본 컬럼 사용
    const safeSortBy = getDefaultSortColumn(table, sortByParam)
    dataQuery = dataQuery.order(safeSortBy, { ascending: sortOrder === 'asc' })

    // 페이지네이션 적용
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10
    const safePage = Number.isFinite(page) && page >= 0 ? page : 0
    const from = safePage * safeLimit
    const to = from + safeLimit - 1
    dataQuery = dataQuery.range(from, to)

    const [{ count, error: countError }, { data, error: dataError }] = await Promise.all([
      countQuery,
      dataQuery,
    ])

    if (countError || dataError) {
      console.error(`테이블 ${table} 데이터 조회 오류:`, countError || dataError)
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
        totalPages: Math.ceil((count || 0) / (limit || 1))
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
    
    // 기본 데이터 검증
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ 
        success: false, 
        error: '유효하지 않은 데이터입니다.' 
      }, { status: 400 })
    }

    const supabase = table === 'api_keys' || table === 'deleted_items' 
      ? getSupabaseAdmin() 
      : getSupabaseClient()

    // 현재 시간 추가
    const now = new Date().toISOString()
    
    // ID 필드 제거 (UUID로 자동 생성됨)
    const { id, ...bodyWithoutId } = body
    
    const dataToInsert = {
      ...bodyWithoutId,
      created_at: now,
      updated_at: now
    }

    // 테이블별 특별 검증
    if (table === 'api_keys') {
      if (!dataToInsert.provider || !dataToInsert.name) {
        return NextResponse.json({ 
          success: false, 
          error: '제공업체와 이름은 필수 입력 항목입니다.' 
        }, { status: 400 })
      }
    }

    if (table === 'ep_data') {
      if (!dataToInsert.title) {
        return NextResponse.json({ 
          success: false, 
          error: '제목은 필수 입력 항목입니다.' 
        }, { status: 400 })
      }
    }

    if (table === 'city_images') {
      if (!dataToInsert.city || !dataToInsert.image_link) {
        return NextResponse.json({ 
          success: false, 
          error: '도시와 이미지 링크는 필수 입력 항목입니다.' 
        }, { status: 400 })
      }
    }

    if (table === 'titles') {
      if (!dataToInsert.title || !dataToInsert.city) {
        return NextResponse.json({ 
          success: false, 
          error: '제목과 도시는 필수 입력 항목입니다.' 
        }, { status: 400 })
      }
    }

    const { data, error } = await supabase
      .from(table)
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error(`테이블 ${table} 데이터 생성 오류:`, error)
      
      // 구체적인 오류 메시지 제공
      let errorMessage = '데이터 생성에 실패했습니다.'
      
      if (error.code === '23505') {
        errorMessage = '중복된 데이터가 있습니다. 다른 값을 입력해주세요.'
      } else if (error.code === '23503') {
        errorMessage = '참조하는 데이터가 존재하지 않습니다.'
      } else if (error.code === '23514') {
        errorMessage = '데이터 형식이 올바르지 않습니다.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: `${table} 테이블에 데이터가 성공적으로 생성되었습니다.`
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

// 테이블별 기본 정렬 컬럼 (요청 컬럼이 유효하지 않을 경우 대체)
function getDefaultSortColumn(table: string, requested: string): string {
  const tableToColumns: Record<string, string[]> = {
    ep_data: ['created_at', 'updated_at', 'id'],
    city_images: ['created_at', 'id'],
    titles: ['created_at', 'id'],
    api_keys: ['created_at', 'id'],
    // deleted_items에는 deleted_at 컬럼이 없으므로 created_at로 정렬
    deleted_items: ['created_at', 'id'],
  }
  const allowed = tableToColumns[table] || ['id']
  // 요청한 컬럼이 허용 목록에 있으면 사용, 아니면 첫 번째 기본값으로 대체
  return allowed.includes(requested) ? requested : allowed[0]
}
