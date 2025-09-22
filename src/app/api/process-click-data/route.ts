import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import iconv from 'iconv-lite'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다' }, { status: 400 })
    }

    // CSV 파일을 CP949 인코딩으로 읽기
    const csvBuffer = Buffer.from(await file.arrayBuffer())
    const csvText = iconv.decode(csvBuffer, 'cp949')
    const csvWorkbook = XLSX.read(csvText, { type: 'string' })
    const csvSheetName = csvWorkbook.SheetNames[0]
    const csvData = XLSX.utils.sheet_to_json(csvWorkbook.Sheets[csvSheetName])
    
    // 클릭수가 0인 상품들의 상품명 추출
    const zeroClickProducts = csvData
      .filter((row: unknown) => {
        const record = row as Record<string, unknown>
        return Number(record['클릭수']) === 0
      })
      .map((row: unknown) => {
        const record = row as Record<string, unknown>
        return {
          id: String(record['상품ID']),
          title: String(record['상품명'])
        }
      })

    if (zeroClickProducts.length === 0) {
      return NextResponse.json({ 
        deletedItems: [],
        createdItems: [],
        message: '클릭수가 0인 상품이 없습니다.' 
      })
    }

    // 데이터베이스에서 모든 EP 데이터 가져오기 (original_id 포함)
    // RLS 영향을 받지 않도록 관리자 클라이언트 사용
    const supabase = getSupabaseAdmin()
    const { data: allEpData, error: epError } = await supabase
      .from('ep_data')
      .select('id, original_id, title, created_at')

    if (epError) {
      console.error('EP 데이터 조회 오류:', epError)
      return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다' }, { status: 500 })
    }

    // 상품명과 original_id를 기준으로 매칭되는 데이터 찾기
    const matchedItems = []
    const unmatchedProducts = []

    for (const product of zeroClickProducts) {
      // 먼저 original_id로 매칭 시도
      let matchedItem = allEpData?.find(epItem => 
        epItem.original_id && epItem.original_id === product.id
      )
      
      // original_id 매칭 실패 시 상품명으로 매칭 시도
      if (!matchedItem) {
        matchedItem = allEpData?.find(epItem => 
          epItem.title && epItem.title.trim() === product.title.trim()
        )
      }
      
      if (matchedItem) {
        matchedItems.push(matchedItem)
      } else {
        unmatchedProducts.push(product)
      }
    }

    // 삭제될 데이터 (매칭된 기존 데이터)
    const deletedItems = matchedItems

    // 새로 생성될 데이터 (ID, title, image_link, add_image_link, video_url만 변경)
    const createdItems = deletedItems.map(item => {
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      // original_id에서 정보 추출 (original_id가 없는 경우 기존 id 사용)
      const sourceId = item.original_id || item.id
      const originalIdParts = sourceId.split('_')
      const code = originalIdParts[1] || '000'
      const cityCodeOrName = originalIdParts[2] || 'seoul'
      const city = cityCodeOrName.toLowerCase()
      
      // 새로운 original_id 생성
      const newOriginalId = `${currentDate}_${code}_${city}_0001`
      
      return {
        ...item,
        // id는 UUID로 자동 생성되므로 제거
        id: undefined,
        // original_id에 새로운 ID 저장
        original_id: newOriginalId,
        title: `${city} 특별 여행 상품`,
        image_link: `https://example.com/images/${city}/main.jpg`,
        add_image_link: `https://example.com/images/${city}/add1.jpg|https://example.com/images/${city}/add2.jpg|https://example.com/images/${city}/add3.jpg`,
        video_url: `https://example.com/videos/${city}/intro.mp4`,
        // created_at, updated_at는 자동 생성되므로 제거
        created_at: undefined,
        updated_at: undefined
      }
    })

    return NextResponse.json({
      deletedItems,
      createdItems,
      unmatchedProducts, // 매칭되지 않은 상품들도 반환
      message: `클릭수 0인 상품 ${zeroClickProducts.length}개 중 ${matchedItems.length}개가 EP 데이터와 매칭되었습니다.`
    })
  } catch (error) {
    console.error('클릭수 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
