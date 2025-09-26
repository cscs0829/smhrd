import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다' },
        { status: 400 }
      )
    }

    // Excel 파일 읽기
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // id와 title 컬럼 추출
    const items = jsonData.map((row: unknown) => {
      const record = row as Record<string, unknown>
      return {
        id: String(record.id || record.ID || ''),
        title: String(record.title || record.제목 || '')
      }
    }).filter(item => item.id && item.title)

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Excel 파일에서 유효한 데이터를 찾을 수 없습니다. id와 title 컬럼을 확인해주세요.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    // 1. 기존 DB의 모든 데이터 조회
    const { data: existingData, error: fetchError } = await supabase
      .from('ep_data')
      .select('id, title')

    if (fetchError) {
      console.error('기존 데이터 조회 오류:', fetchError)
      return NextResponse.json(
        { error: '기존 데이터 조회 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    const existingIds = new Set(existingData?.map(item => item.id) || [])
    const excelIds = new Set(items.map(item => item.id).filter(Boolean))

    // 2. Excel에 있지만 DB에 없는 데이터 (새로 추가할 데이터)
    const newItems = items.filter(item => 
      item.id && item.title && !existingIds.has(item.id)
    )

    // 3. DB에 있지만 Excel에 없는 데이터 (삭제할 데이터)
    const deletedItems = existingData?.filter(item => 
      !excelIds.has(item.id)
    ) || []

    let addedCount = 0
    let deletedCount = 0

    // 4. 새로운 아이템들을 ep_data에 추가
    if (newItems.length > 0) {
      const { error: insertError } = await supabase
        .from('ep_data')
        .insert(newItems.map(item => ({
          id: item.id,
          title: item.title
        })))

      if (insertError) {
        console.error('새 데이터 삽입 오류:', insertError)
        return NextResponse.json(
          { error: '새 데이터 저장 중 오류가 발생했습니다' },
          { status: 500 }
        )
      }
      addedCount = newItems.length
    }

    // 5. 삭제된 아이템들을 delect 테이블에 추가
    if (deletedItems.length > 0) {
      const { error: deleteError } = await supabase
        .from('delect')
        .insert(deletedItems.map(item => ({
          id: item.id,
          title: item.title
        })))

      if (deleteError) {
        console.error('삭제 데이터 저장 오류:', deleteError)
        return NextResponse.json(
          { error: '삭제 데이터 저장 중 오류가 발생했습니다' },
          { status: 500 }
        )
      }

      // 6. ep_data에서 삭제된 아이템들 제거
      const { error: removeError } = await supabase
        .from('ep_data')
        .delete()
        .in('id', deletedItems.map(item => item.id))

      if (removeError) {
        console.error('ep_data에서 삭제 오류:', removeError)
        return NextResponse.json(
          { error: 'ep_data에서 데이터 삭제 중 오류가 발생했습니다' },
          { status: 500 }
        )
      }

      deletedCount = deletedItems.length
    }

    return NextResponse.json({
      success: true,
      addedCount,
      deletedCount,
      totalExcelItems: items.length,
      totalDbItems: existingData?.length || 0,
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
