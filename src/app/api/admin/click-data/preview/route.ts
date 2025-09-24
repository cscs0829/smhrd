import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 })
    }

    // Supabase 클라이언트 (지연 생성)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: '서버 환경변수가 설정되지 않았습니다.' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    // CSV 파일 읽기 (EUC-KR 인코딩)
    const buffer = await file.arrayBuffer()
    const decoder = new TextDecoder('euc-kr')
    const csvText = decoder.decode(buffer)
    
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV 파일에 데이터가 없습니다.' }, { status: 400 })
    }

    // 헤더 파싱
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const idIndex = headers.findIndex(h => h.includes('상품ID') || h.includes('id') || h.includes('ID'))
    const titleIndex = headers.findIndex(h => h.includes('상품명') || h.includes('제목') || h.includes('title') || h.includes('Title'))
    const clicksIndex = headers.findIndex(h => h.includes('클릭수') || h.includes('clicks') || h.includes('Clicks'))

    if (idIndex === -1 || titleIndex === -1 || clicksIndex === -1) {
      return NextResponse.json({ 
        error: '필수 컬럼을 찾을 수 없습니다. 상품ID, 상품명, 클릭수 컬럼이 필요합니다.' 
      }, { status: 400 })
    }

    // 데이터 파싱
    const parsed = lines.slice(1)
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        
        const id = values[idIndex]
        const title = values[titleIndex]
        const clicks = parseInt(values[clicksIndex]) || 0

        if (!id || !title) {
          console.warn(`행 ${index + 2}: ID 또는 제목이 없습니다.`, values)
          return null
        }

        return {
          id: String(id).trim(),
          title: String(title).trim(),
          clicks
        }
      })

    const csvItems = parsed.filter((i): i is { id: string; title: string; clicks: number } => i !== null)

    if (csvItems.length === 0) {
      return NextResponse.json({ error: '유효한 데이터가 없습니다.' }, { status: 400 })
    }

    // 기존 데이터 조회
    const { data: existingData, error: fetchError } = await supabase
      .from('ep_data')
      .select('id, title')

    if (fetchError) {
      console.error('기존 데이터 조회 오류:', fetchError)
      return NextResponse.json({ error: '기존 데이터 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 0클릭 상품과 새 데이터 분류
    const existingIds = new Set(existingData?.map(item => item.id) || [])
    const existingTitles = new Set(existingData?.map(item => item.title) || [])

    const zeroClickItems: Array<{id: string, title: string, clicks: number}> = []
    const newItems: Array<{id: string, title: string, clicks: number}> = []
    const existingItems: Array<{id: string, title: string, clicks: number}> = []

    csvItems.forEach((item) => {
      if (item.clicks === 0) {
        zeroClickItems.push(item)
      } else if (existingIds.has(item.id) || existingTitles.has(item.title)) {
        existingItems.push(item)
      } else {
        newItems.push(item)
      }
    })

    return NextResponse.json({
      success: true,
      totalCount: csvItems.length,
      zeroClickItems,
      newItems,
      existingItems,
      summary: {
        totalCsvItems: csvItems.length,
        totalDbItems: existingData?.length || 0,
        zeroClickCount: zeroClickItems.length,
        newItemsCount: newItems.length,
        existingItemsCount: existingItems.length
      }
    })

  } catch (error) {
    console.error('클릭수 데이터 미리보기 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
