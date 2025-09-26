import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const { table, ids } = await request.json()

    if (!table || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '테이블 이름과 삭제할 ID 목록이 필요합니다' },
        { status: 400 }
      )
    }

    // 허용된 테이블 목록
    const allowedTables = ['ep_data', 'deleted_items', 'api_keys', 'city_images', 'titles']
    if (!allowedTables.includes(table)) {
      return NextResponse.json(
        { error: '허용되지 않은 테이블입니다' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // ID 필드명 결정
    let idField = 'id'
    if (table === 'ep_data') {
      idField = 'id' // text ID
    } else if (table === 'deleted_items') {
      idField = 'id' // bigserial ID
    } else if (table === 'api_keys') {
      idField = 'id' // bigserial ID
    } else if (table === 'city_images') {
      idField = 'id' // bigserial ID
    } else if (table === 'titles') {
      idField = 'id' // uuid ID
    }

    // 데이터 삭제
    const { error } = await supabase
      .from(table)
      .delete()
      .in(idField, ids)

    if (error) {
      console.error('데이터 삭제 오류:', error)
      return NextResponse.json(
        { error: '데이터 삭제에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length}개 항목이 삭제되었습니다`,
      deletedCount: ids.length
    })

  } catch (error) {
    console.error('데이터 삭제 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
