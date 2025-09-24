import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 선택되지 않았습니다.' }, { status: 400 })
    }

    // CSV 파일 읽기 (EUC-KR 인코딩 처리)
    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder('euc-kr')
    const csvText = decoder.decode(arrayBuffer)
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV 파일에 데이터가 없습니다.' }, { status: 400 })
    }

    // 헤더 파싱
    const headers = lines[0].split(',').map(h => h.trim())
    const productIdIndex = headers.findIndex(h => h.includes('상품ID') || h.includes('상품id'))
    const productNameIndex = headers.findIndex(h => h.includes('상품명') || h.includes('상품이름'))
    const clickCountIndex = headers.findIndex(h => h.includes('클릭수') || h.includes('클릭'))

    if (productIdIndex === -1 || productNameIndex === -1 || clickCountIndex === -1) {
      return NextResponse.json({ 
        error: 'CSV 파일에 필요한 컬럼(상품ID, 상품명, 클릭수)을 찾을 수 없습니다.' 
      }, { status: 400 })
    }

    // 데이터 파싱
    const csvData = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      return {
        productId: values[productIdIndex],
        productName: values[productNameIndex],
        clickCount: parseInt(values[clickCountIndex]) || 0
      }
    }).filter(item => item.productId && item.productName)

    // 클릭수가 0인 데이터만 필터링
    const zeroClickData = csvData.filter(item => item.clickCount === 0)

    if (zeroClickData.length === 0) {
      return NextResponse.json({
        success: true,
        message: '클릭수가 0인 데이터가 없습니다.',
        totalCsvItems: csvData.length,
        zeroClickItems: 0,
        movedToDelect: 0,
        notFoundInEpData: 0
      })
    }

    const supabase = getSupabaseClient()

    // 1. ep_data 테이블의 모든 데이터 조회
    const { data: epData, error: fetchError } = await supabase
      .from('ep_data')
      .select('id, title')

    if (fetchError) {
      console.error('ep_data 조회 오류:', fetchError)
      return NextResponse.json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const epDataMap = new Map(epData?.map(item => [item.id, item.title]) || [])

    // 2. 클릭수가 0인 데이터를 ep_data와 매칭
    const matchedItems = zeroClickData.filter(item => epDataMap.has(item.productId))
    const notFoundItems = zeroClickData.filter(item => !epDataMap.has(item.productId))

    let movedToDelectCount = 0
    let notFoundInEpDataCount = 0

    // 3. ep_data에 있는 데이터들을 delect 테이블로 이동
    if (matchedItems.length > 0) {
      const { error: insertError } = await supabase
        .from('delect')
        .insert(matchedItems.map(item => ({
          id: item.productId,
          title: item.productName
        })))

      if (insertError) {
        console.error('delect 테이블 삽입 오류:', insertError)
        return NextResponse.json({ error: 'delect 테이블에 데이터 삽입 중 오류가 발생했습니다.' }, { status: 500 })
      }

      // 4. ep_data에서 해당 데이터들 삭제
      const { error: deleteError } = await supabase
        .from('ep_data')
        .delete()
        .in('id', matchedItems.map(item => item.productId))

      if (deleteError) {
        console.error('ep_data 테이블 삭제 오류:', deleteError)
        return NextResponse.json({ error: 'ep_data 테이블에서 데이터 삭제 중 오류가 발생했습니다.' }, { status: 500 })
      }

      movedToDelectCount = matchedItems.length
    }

    // 5. ep_data에 없는 데이터들도 delect 테이블에 추가
    if (notFoundItems.length > 0) {
      const { error: insertNotFoundError } = await supabase
        .from('delect')
        .insert(notFoundItems.map(item => ({
          id: item.productId,
          title: item.productName
        })))

      if (insertNotFoundError) {
        console.error('delect 테이블에 없는 데이터 삽입 오류:', insertNotFoundError)
        return NextResponse.json({ error: 'delect 테이블에 없는 데이터 삽입 중 오류가 발생했습니다.' }, { status: 500 })
      }

      notFoundInEpDataCount = notFoundItems.length
    }

    return NextResponse.json({
      success: true,
      message: '클릭수 데이터 처리가 완료되었습니다.',
      totalCsvItems: csvData.length,
      zeroClickItems: zeroClickData.length,
      movedToDelect: movedToDelectCount,
      notFoundInEpData: notFoundInEpDataCount,
      totalMovedToDelect: movedToDelectCount + notFoundInEpDataCount
    })

  } catch (error) {
    console.error('클릭수 데이터 처리 오류:', error)
    return NextResponse.json({ 
      error: '클릭수 데이터 처리 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}
