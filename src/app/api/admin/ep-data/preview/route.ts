import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

function getField(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const value = obj[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

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

    // Excel 파일 읽기
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json({ error: '파일에 데이터가 없습니다.' }, { status: 400 })
    }

    // 데이터 검증 및 변환
    const parsed = data
      .map((item, index) => {
        const idRaw = getField(item, ['id', 'ID', 'Id', '상품ID'])
        const titleRaw = getField(item, ['title', 'Title', '제목', '상품명'])

        if (!idRaw || !titleRaw) {
          console.warn(`행 ${index + 2}: ID 또는 제목이 없습니다.`, item)
          return null
        }

        return {
          id: String(idRaw).trim(),
          title: String(titleRaw).trim(),
        }
      })

    const excelItems = parsed.filter((i): i is { id: string; title: string } => i !== null)

    if (excelItems.length === 0) {
      return NextResponse.json({ error: '유효한 데이터가 없습니다. ID와 제목 컬럼을 확인해주세요.' }, { status: 400 })
    }

    // 전체 DB 데이터 페이지네이션으로 수집 (1000개 배치)
    const batchSize = 1000
    const allDbRows: Array<{ id: string; title: string }> = []

    // 총 개수 조회
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

    // 중복 및 새 데이터 분류
    const existingIds = new Set(allDbRows.map(item => item.id))
    const existingTitles = new Set(allDbRows.map(item => item.title))

    const duplicates: Array<{id: string, title: string}> = []
    const newItems: Array<{id: string, title: string}> = []
    const existingItems: Array<{id: string, title: string}> = []

    excelItems.forEach(item => {
      if (existingIds.has(item.id) || existingTitles.has(item.title)) {
        duplicates.push(item)
      } else {
        newItems.push(item)
      }
    })

    // 기존 데이터에서 Excel에 없는 항목들 찾기
    const excelIds = new Set(excelItems.map(item => item.id))
    const excelTitles = new Set(excelItems.map(item => item.title))
    
    allDbRows.forEach(item => {
      if (!excelIds.has(item.id) && !excelTitles.has(item.title)) {
        existingItems.push(item)
      }
    })

    return NextResponse.json({
      success: true,
      totalCount: excelItems.length,
      duplicates,
      newItems,
      existingItems,
      summary: {
        totalExcelItems: excelItems.length,
        totalDbItems: total,
        newItemsCount: newItems.length,
        duplicatesCount: duplicates.length,
        existingItemsCount: existingItems.length
      }
    })

  } catch (error) {
    console.error('EP 데이터 미리보기 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
