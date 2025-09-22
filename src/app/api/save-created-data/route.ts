import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // 생성된 데이터를 ep_data 테이블 구조에 맞게 변환
    const transformedItems = items.map(item => {
      const transformed = { ...item }
      
      // id는 UUID가 자동 생성되므로 제거 (이미 process-click-data에서 undefined로 설정됨)
      if (transformed.id === undefined) {
        delete transformed.id
      }
      
      // created_at, updated_at는 자동 생성되므로 제거
      delete transformed.created_at
      delete transformed.updated_at
      
      return transformed
    })
    
    // 새로운 데이터를 ep_data 테이블에 저장
    const { data, error } = await supabase
      .from('ep_data')
      .insert(transformedItems)
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
    console.error('생성된 데이터 저장 오류:', error)
    return NextResponse.json(
      { error: '데이터 저장 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
