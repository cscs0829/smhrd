import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: '잘못된 데이터 형식입니다' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // 새로운 아이템들만 필터링 (중복 제거)
    const newItems = []
    let addedCount = 0

    for (const item of items) {
      if (!item.id || !item.title) {
        continue
      }

      // 기존에 같은 ID가 있는지 확인
      const { data: existingItem } = await supabase
        .from('ep_data')
        .select('id')
        .eq('id', item.id)
        .single()

      if (!existingItem) {
        newItems.push({
          id: item.id,
          title: item.title
        })
        addedCount++
      }
    }

    // 새로운 아이템들을 일괄 삽입
    if (newItems.length > 0) {
      const { error } = await supabase
        .from('ep_data')
        .insert(newItems)

      if (error) {
        console.error('데이터 삽입 오류:', error)
        return NextResponse.json(
          { error: '데이터베이스 저장 중 오류가 발생했습니다' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      addedCount,
      totalItems: items.length,
      skippedCount: items.length - addedCount
    })

  } catch (error) {
    console.error('EP 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('ep_data')
      .select('id, title, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('데이터 조회 오류:', error)
      return NextResponse.json(
        { error: '데이터 조회 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0
    })

  } catch (error) {
    console.error('EP 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
