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

    let movedCount = 0
    const movedItems = []

    for (const item of items) {
      if (!item.productId || !item.productName) {
        continue
      }

      // EP 데이터 테이블에서 해당 ID의 데이터 조회
      const { data: epData } = await supabase
        .from('ep_data')
        .select('*')
        .eq('id', item.productId)
        .single()

      if (epData) {
        // delete 테이블에 삽입
        const { error: insertError } = await supabase
          .from('delete')
          .insert({
            product_id: item.productId,
            title: item.productName,
            reason: '클릭수 0'
          })

        if (insertError) {
          console.error('delete 테이블 삽입 오류:', insertError)
          continue
        }

        // EP 데이터 테이블에서 삭제
        const { error: deleteError } = await supabase
          .from('ep_data')
          .delete()
          .eq('id', item.productId)

        if (deleteError) {
          console.error('ep_data 테이블 삭제 오류:', deleteError)
          // 삭제 실패 시 delete 테이블에서도 제거
          await supabase
            .from('delete')
            .delete()
            .eq('product_id', item.productId)
          continue
        }

        movedItems.push({
          productId: item.productId,
          title: item.productName
        })
        movedCount++
      }
    }

    return NextResponse.json({
      success: true,
      movedCount,
      totalItems: items.length,
      movedItems
    })

  } catch (error) {
    console.error('삭제 테이블 이동 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
