import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // 삭제된 데이터를 deleted_items 테이블에 저장
    const { data: backupData, error: backupError } = await supabase
      .from('deleted_items')
      .insert(items.map(item => ({
        original_id: item.id,
        original_data: item, // 전체 데이터를 JSONB로 저장
        reason: 'EP데이터 처리에서 삭제됨'
      })))
      .select()

    if (backupError) {
      console.error('백업 저장 오류:', backupError)
      return NextResponse.json({ error: '백업 저장 중 오류가 발생했습니다' }, { status: 500 })
    }

    // 원본 테이블에서 데이터 삭제
    const itemIds = items.map(item => item.id)
    const { error: deleteError } = await supabase
      .from('ep_data')
      .delete()
      .in('id', itemIds)

    if (deleteError) {
      console.error('데이터 삭제 오류:', deleteError)
      return NextResponse.json({ error: '데이터 삭제 중 오류가 발생했습니다' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${items.length}개의 삭제된 데이터가 보관소에 이동되었습니다`,
      backupData 
    })
  } catch (error) {
    console.error('삭제된 EP 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '데이터 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
