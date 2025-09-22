import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import ExcelJS from 'exceljs'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    // EP 데이터와 삭제된 데이터를 모두 가져오기
    const [epDataResult, deletedDataResult] = await Promise.all([
      supabase.from('ep_data').select('*').order('created_at', { ascending: false }),
      supabase.from('deleted_items').select('*').order('created_at', { ascending: false })
    ])

    if (epDataResult.error) {
      console.error('EP 데이터 조회 오류:', epDataResult.error)
      return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다' }, { status: 500 })
    }

    if (deletedDataResult.error) {
      console.error('삭제된 데이터 조회 오류:', deletedDataResult.error)
      return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다' }, { status: 500 })
    }

    // Excel 파일 생성
    const workbook = new ExcelJS.Workbook()
    
    // EP 데이터 시트
    const epWorksheet = workbook.addWorksheet('EP_Data')
    if (epDataResult.data && epDataResult.data.length > 0) {
      epWorksheet.columns = Object.keys(epDataResult.data[0]).map((key) => ({ header: key, key }))
      epDataResult.data.forEach((row) => {
        epWorksheet.addRow(row)
      })
    }

    // 삭제된 데이터 시트
    const deletedWorksheet = workbook.addWorksheet('Deleted_Data')
    if (deletedDataResult.data && deletedDataResult.data.length > 0) {
      // 삭제된 데이터는 original_data를 펼쳐서 표시
      const flattenedDeletedData = deletedDataResult.data.map(item => ({
        deleted_id: item.id,
        original_id: item.original_id,
        reason: item.reason,
        deleted_at: item.created_at,
        ...item.original_data
      }))
      
      deletedWorksheet.columns = Object.keys(flattenedDeletedData[0]).map((key) => ({ header: key, key }))
      flattenedDeletedData.forEach((row) => {
        deletedWorksheet.addRow(row)
      })
    }

    const excelBuffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(Buffer.from(excelBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="전체_데이터.xlsx"',
      },
    })
  } catch (error) {
    console.error('전체 데이터 내보내기 오류:', error)
    return NextResponse.json(
      { error: '데이터 내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
