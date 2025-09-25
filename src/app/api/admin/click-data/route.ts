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

    // 0클릭 상품만 필터링
    const zeroClickItems = csvItems.filter(item => item.clicks === 0)

    if (zeroClickItems.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: '클릭수가 0인 상품이 없습니다.',
        totalCsvItems: csvItems.length,
        zeroClickItems: 0,
        movedToDelect: 0,
        notFoundInEpData: 0,
        totalMovedToDelect: 0
      })
    }

    // 전체 DB 데이터 페이지네이션으로 수집 (1000개 배치)
    const batchSize = 1000
    const allDbRows: Array<{ id: string; title: string }> = []

    const { count: totalCount, error: countError } = await supabase
      .from('ep_data')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count error:', countError)
      return NextResponse.json({ error: '기존 데이터 개수 조회 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const total = totalCount ?? 0
    const totalBatches = Math.max(1, Math.ceil(total / batchSize))

    for (let batch = 0; batch < totalBatches; batch++) {
      const from = batch * batchSize
      const to = Math.min(from + batchSize - 1, total - 1)
      const { data: pageRows, error: pageError } = await supabase
        .from('ep_data')
        .select('id, title')
        .range(from, to)

      if (pageError) {
        console.error('Page fetch error:', pageError)
        return NextResponse.json({ error: '기존 데이터 조회 중 오류가 발생했습니다.' }, { status: 500 })
      }
      if (pageRows && pageRows.length > 0) {
        allDbRows.push(...pageRows)
      }
    }

    // 0클릭 상품을 delect 테이블로 이동
    const existingIds = new Set(allDbRows.map(item => item.id))
    const existingTitles = new Set(allDbRows.map(item => item.title))

    let movedToDelect = 0
    let notFoundInEpData = 0

    for (const item of zeroClickItems) {
      const isInEpData = existingIds.has(item.id) || existingTitles.has(item.title)
      
      if (isInEpData) {
        // ep_data에서 delect로 이동
        const { error: moveError } = await supabase
          .from('delect')
          .insert({
            original_id: item.id,
            original_data: { id: item.id, title: item.title },
            reason: '클릭수 0개로 인한 이동'
          })

        if (!moveError) {
          // ep_data에서 삭제
          const { error: deleteError } = await supabase
            .from('ep_data')
            .delete()
            .or(`id.eq.${item.id},title.eq.${item.title}`)

          if (!deleteError) {
            movedToDelect++
          }
        }
      } else {
        // ep_data에 없던 데이터는 delect에만 추가
        const { error: insertError } = await supabase
          .from('delect')
          .insert({
            original_id: item.id,
            original_data: { id: item.id, title: item.title },
            reason: '클릭수 0개 (ep_data에 없던 데이터)'
          })

        if (!insertError) {
          notFoundInEpData++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: '클릭수 데이터 처리가 완료되었습니다.',
      totalCsvItems: csvItems.length,
      zeroClickItems: zeroClickItems.length,
      movedToDelect,
      notFoundInEpData,
      totalMovedToDelect: movedToDelect + notFoundInEpData
    })

  } catch (error) {
    console.error('클릭수 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
