import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다' }, { status: 400 })
    }

    // 파일을 버퍼로 읽기
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    // 첫 번째 시트의 데이터 읽기
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)
    
    // 데이터베이스에서 기존 데이터 가져오기 (original_id 포함)
    const supabase = getSupabaseClient()
    const { data: existingData, error: epError } = await supabase
      .from('ep_data')
      .select('id, original_id, title, created_at')
      .order('created_at', { ascending: false })

    if (epError) {
      console.error('EP 데이터 조회 오류:', epError)
      return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다' }, { status: 500 })
    }
    
    // 데이터 비교 로직
    const comparisonResult = compareEPData(jsonData as Array<{ id: string; title?: string; [key: string]: unknown }>, existingData || [])
    
    return NextResponse.json(comparisonResult)
  } catch (error) {
    console.error('EP 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

function compareEPData(newData: Array<{ id: string; title?: string; [key: string]: unknown }>, existingData: Array<{ id: string; original_id?: string; title?: string; [key: string]: unknown }>) {
  // original_id 기반으로 비교 (Excel ID와 DB original_id 매칭)
  const existingOriginalIdMap = new Map()
  const existingTitleMap = new Map()
  
  existingData.forEach(item => {
    if (item.original_id) {
      existingOriginalIdMap.set(item.original_id, item)
    }
    if (item.title) {
      existingTitleMap.set(item.title.toLowerCase().trim(), item)
    }
  })
  
  const newOriginalIdMap = new Map()
  const newTitleMap = new Map()
  
  newData.forEach(item => {
    if (item.id) {
      newOriginalIdMap.set(item.id, item)
    }
    if (item.title) {
      newTitleMap.set(item.title.toLowerCase().trim(), item)
    }
  })
  
  // 새로운 데이터 중에서 original_id나 title이 기존에 없는 것들
  const newItems = newData.filter(item => {
    const hasOriginalId = item.id && existingOriginalIdMap.has(item.id)
    const hasTitle = item.title && existingTitleMap.has(item.title.toLowerCase().trim())
    return !hasOriginalId && !hasTitle
  })
  
  // 기존 데이터 중에서 original_id나 title이 새로운 데이터에 없는 것들 (삭제된 항목)
  const removedItems = existingData.filter(item => {
    const hasOriginalId = item.original_id && newOriginalIdMap.has(item.original_id)
    const hasTitle = item.title && newTitleMap.has(item.title.toLowerCase().trim())
    return !hasOriginalId && !hasTitle
  })
  
  // 기존 데이터 중에서 original_id나 title이 새로운 데이터에 있는 것들
  const existingItems = newData.filter(item => {
    const hasOriginalId = item.id && existingOriginalIdMap.has(item.id)
    const hasTitle = item.title && existingTitleMap.has(item.title.toLowerCase().trim())
    return hasOriginalId || hasTitle
  })
  
  return {
    newItems,
    removedItems,
    existingItems
  }
}
