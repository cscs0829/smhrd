import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다' }, { status: 400 })
    }

    // Excel 파일 생성
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('삭제된_데이터')

    if (items.length > 0) {
      // 헤더 추가
      worksheet.columns = Object.keys(items[0]).map((key) => ({ header: key, key }))

      // 데이터 추가
      items.forEach((row) => {
        worksheet.addRow(row)
      })
    }

    const excelBuffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(Buffer.from(excelBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="삭제된_데이터.xlsx"',
      },
    })
  } catch (error) {
    console.error('삭제된 데이터 내보내기 오류:', error)
    return NextResponse.json(
      { error: '데이터 내보내기 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
