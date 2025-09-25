import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

type AllowedTable = 'ep_data' | 'delect' | 'api'

interface UpdateBody {
  table: AllowedTable
  id: string | number
  values: Record<string, unknown>
}

const TABLE_ID_FIELD: Record<AllowedTable, string> = {
  ep_data: 'id',
  delect: 'id',
  api: 'id',
}

// 컬럼 화이트리스트: 유지보수와 안전을 위해 허용된 컬럼만 업데이트
const ALLOWED_UPDATE_COLUMNS: Record<AllowedTable, Set<string>> = {
  // EP 데이터: id, title, created_at, updated_at 허용
  ep_data: new Set(['id', 'title', 'created_at', 'updated_at']),
  // 삭제 아이템: id, title, created_at, updated_at 허용
  delect: new Set(['id', 'title', 'created_at', 'updated_at']),
  // API 키: name, api_key, is_active, is_default, created_at, updated_at 허용
  api: new Set(['name', 'api_key', 'is_active', 'is_default', 'created_at', 'updated_at']),
}

export async function PATCH(req: NextRequest) {
  try {
    const { table, id, values } = (await req.json()) as UpdateBody

    if (!table || !id || !values || typeof values !== 'object') {
      return NextResponse.json(
        { error: 'table, id, values가 필요합니다.' },
        { status: 400 }
      )
    }

    if (!['ep_data', 'delect', 'api'].includes(table)) {
      return NextResponse.json(
        { error: '허용되지 않은 테이블입니다.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // values에서 허용된 컬럼만 필터링
    const whitelist = ALLOWED_UPDATE_COLUMNS[table as AllowedTable]
    const filteredValues: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(values)) {
      if (whitelist.has(key)) {
        filteredValues[key] = val
      }
    }

    if (Object.keys(filteredValues).length === 0) {
      return NextResponse.json(
        { error: '업데이트할 유효한 컬럼이 없습니다.' },
        { status: 400 }
      )
    }

    const idField = TABLE_ID_FIELD[table as AllowedTable]

    const { data, error } = await supabase
      .from(table)
      .update(filteredValues)
      .eq(idField, id)
      .select()
      .single()

    if (error) {
      console.error('업데이트 오류:', error)
      return NextResponse.json(
        { error: '데이터 업데이트에 실패했습니다.', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('업데이트 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


