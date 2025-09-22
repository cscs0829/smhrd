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
    
    // 데이터베이스에서 기존 데이터 가져오기 (실제 구현에서는 Supabase 사용)
    const { allData, deletedItems } = await getExistingEPData()
    
    // 데이터 비교 로직
    const comparisonResult = compareEPData(jsonData as Array<{ id: string; title?: string; [key: string]: unknown }>, allData)
    
    // 삭제된 데이터도 함께 반환
    return NextResponse.json({
      ...comparisonResult,
      deletedItems: deletedItems
    })
  } catch (error) {
    console.error('EP 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

async function getExistingEPData() {
  const supabase = getSupabaseClient()
  
  // 현재 활성 데이터와 삭제된 데이터를 모두 가져오기
  const [activeData, deletedData] = await Promise.all([
    supabase
      .from('ep_data')
      .select('id, title, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('deleted_items')
      .select('original_id, original_data, created_at')
      .order('created_at', { ascending: false })
  ])
  
  if (activeData.error) {
    console.error('활성 데이터 조회 오류:', activeData.error)
  }
  
  if (deletedData.error) {
    console.error('삭제된 데이터 조회 오류:', deletedData.error)
  }
  
  // 삭제된 데이터에서 title 추출
  const deletedItemsWithTitle = (deletedData.data || []).map((item: { original_id: string; original_data: { title?: string }; created_at: string }) => ({
    id: item.original_id,
    title: item.original_data?.title || '',
    created_at: item.created_at,
    deleted_at: item.created_at // 삭제된 시점
  }))
  
  // 활성 데이터와 삭제된 데이터를 합쳐서 반환
  const allData = [
    ...(activeData.data || []),
    ...deletedItemsWithTitle
  ]
  
  return {
    allData,
    deletedItems: deletedItemsWithTitle
  }
}

function compareEPData(newData: Array<{ id: string; title?: string; [key: string]: unknown }>, existingData: Array<{ id: string; title?: string; [key: string]: unknown }>) {
  // ID와 title을 모두 고려한 비교를 위해 Map 사용
  const existingDataMap = new Map()
  existingData.forEach(item => {
    existingDataMap.set(item.id, item)
    // title도 키로 사용하여 중복 검사
    if (item.title) {
      existingDataMap.set(`title_${item.title.toLowerCase().trim()}`, item)
    }
  })
  
  const newDataMap = new Map()
  newData.forEach(item => {
    newDataMap.set(item.id, item)
    if (item.title) {
      newDataMap.set(`title_${item.title.toLowerCase().trim()}`, item)
    }
  })
  
  // 새로운 데이터 중에서 ID나 title이 기존에 없는 것들
  const newItems = newData.filter(item => {
    const hasId = existingDataMap.has(item.id)
    const hasTitle = item.title && existingDataMap.has(`title_${item.title.toLowerCase().trim()}`)
    return !hasId && !hasTitle
  })
  
  // 기존 데이터 중에서 ID가 새로운 데이터에 없는 것들 (삭제된 항목)
  const removedItems = existingData.filter(item => {
    // 백업 테이블에서 온 데이터는 제외 (이미 삭제된 것으로 간주)
    return !newDataMap.has(item.id) && !item.deleted_at
  })
  
  // 기존 데이터 중에서 ID나 title이 새로운 데이터에 있는 것들
  const existingItems = newData.filter(item => {
    const hasId = existingDataMap.has(item.id)
    const hasTitle = item.title && existingDataMap.has(`title_${item.title.toLowerCase().trim()}`)
    return hasId || hasTitle
  })
  
  return {
    newItems,
    removedItems,
    existingItems
  }
}
