import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // 새로운 데이터를 데이터베이스에 저장
    const { data, error } = await supabase
      .from('ep_data')
      .insert(items)
      .select()

    if (error) {
      console.error('데이터 저장 오류:', error)
      return NextResponse.json({ error: '데이터 저장 중 오류가 발생했습니다' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${items.length}개의 새로운 데이터가 저장되었습니다`,
      data 
    })
  } catch (error) {
    console.error('새로운 EP 데이터 저장 오류:', error)
    return NextResponse.json(
      { error: '데이터 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
