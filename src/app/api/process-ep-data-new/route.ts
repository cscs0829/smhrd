import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import * as XLSX from 'xlsx'
import { getSupabaseAdmin } from '@/lib/supabase'

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
    const rawJsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet)

    // 엑셀 헤더/값 정규화
    const jsonData = normalizeExcelRows(rawJsonData)
    
    // 데이터베이스에서 기존 데이터 가져오기 (original_id 포함)
    // RLS 영향을 받지 않도록 관리자 클라이언트 사용
    const supabase = getSupabaseAdmin()
    const { data: existingData, error: epError } = await supabase
      .from('ep_data')
      .select('id, original_id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(20000)

    if (epError) {
      console.error('EP 데이터 조회 오류:', epError)
      return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다' }, { status: 500 })
    }
    
    // 데이터 비교 로직
    const comparisonResult = compareEPData(jsonData, existingData || [])

    // 디버그: 세트/카운트 로깅 및 진단 정보 동봉
    console.log('[process-ep-data-new] excel_count:', jsonData.length, 'db_count:', existingData?.length || 0,
      'toAdd:', comparisonResult.itemsToAdd.length,
      'toRemove:', comparisonResult.itemsToRemove.length,
      'unchanged:', comparisonResult.unchangedItems.length)
    if (comparisonResult.itemsToAdd.length > 0) {
      console.log('[process-ep-data-new] sample itemsToAdd ids:', comparisonResult.itemsToAdd.slice(0, 5).map(i => i.id))
    }
    
    const body = {
      ...comparisonResult,
      // 최상위에 디버그 정보 노출 (일부 뷰어에서 _prefix 숨김 방지)
      excel_count: jsonData.length,
      db_count: existingData?.length || 0,
      to_add: comparisonResult.itemsToAdd.length,
      to_remove: comparisonResult.itemsToRemove.length,
      unchanged_count: comparisonResult.unchangedItems.length,
      sample_to_add: comparisonResult.itemsToAdd.slice(0, 5).map(i => ({ id: i.id, title: i.title }))
    }
    return new NextResponse(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('EP 데이터 처리 오류:', error)
    return NextResponse.json(
      { error: '파일 처리 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// 헤더/값 정규화: 다양한 한글/영문 헤더를 통일하고 문자열은 trim/lower
function normalizeExcelRows(rows: Array<Record<string, unknown>>): Array<{ id?: string; title?: string; [key: string]: unknown }> {
  const headerMap: Record<string, string> = {
    // id 계열
    'id': 'id', 'ID': 'id', '상품id': 'id', '상품ID': 'id', '상품Id': 'id', '상품 id': 'id',
    // title 계열
    'title': 'title', 'TITLE': 'title', '제목': 'title', '상품명': 'title', '상품 명': 'title'
  }

  const normalizeKey = (key: string): string => {
    const keyTrim = key.trim()
    const direct = headerMap[keyTrim]
    if (direct) return direct
    const lower = keyTrim.toLowerCase()
    return headerMap[lower] || lower
  }

  const normalizeValue = (val: unknown): unknown => {
    if (typeof val === 'string') return val.trim()
    return val
  }

  return rows.map((row) => {
    const normalized: Record<string, unknown> = {}
    Object.entries(row).forEach(([k, v]) => {
      const nk = normalizeKey(String(k))
      const nv = normalizeValue(v)
      normalized[nk] = nv
    })
    return normalized as { id?: string; title?: string; [key: string]: unknown }
  })
}

function compareEPData(
  newData: Array<{ id?: string; title?: string; [key: string]: unknown }>,
  existingData: Array<{ id: string; original_id?: string | null; title?: string | null; [key: string]: unknown }>
) {
  const normalizeStr = (s: unknown): string | null => {
    if (!s) return null
    const str = String(s).trim()
    if (!str) return null
    return str.toLowerCase()
  }

  // 기존 데이터 인덱스 구성
  const existingOriginalIdSet = new Set<string>()
  const existingTitleSet = new Set<string>()

  for (const item of existingData) {
    const oid = normalizeStr(item.original_id)
    if (oid) existingOriginalIdSet.add(oid)
    const t = normalizeStr(item.title)
    if (t) existingTitleSet.add(t)
  }

  // 새 데이터 인덱스 구성
  const newOriginalIdSet = new Set<string>()
  const newTitleSet = new Set<string>()

  for (const item of newData) {
    const nid = normalizeStr(item.id)
    if (nid) newOriginalIdSet.add(nid)
    const t = normalizeStr(item.title)
    if (t) newTitleSet.add(t)
  }

  // 추가할 항목: (id가 있고 그 id가 기존 original_id에 없고) AND (제목이 없거나 제목도 기존에 없음)
  const itemsToAdd = newData.filter((item) => {
    const nid = normalizeStr(item.id)
    const t = normalizeStr(item.title)

    const hasByOriginalId = nid ? existingOriginalIdSet.has(nid) : false
    const hasByTitle = t ? existingTitleSet.has(t) : false

    return !(hasByOriginalId || hasByTitle)
  })

  // 제거할 항목: 기존 데이터 중에서 (original_id가 새 id 세트에 없고) AND (제목도 새 제목 세트에 없음)
  const itemsToRemove = existingData.filter((item) => {
    const oid = normalizeStr(item.original_id)
    const t = normalizeStr(item.title)

    const presentByOriginalId = oid ? newOriginalIdSet.has(oid) : false
    const presentByTitle = t ? newTitleSet.has(t) : false

    return !(presentByOriginalId || presentByTitle)
  })

  // 변경 없음 항목: 새 데이터 중에서 (original_id 또는 제목으로 기존에 존재)
  const unchangedItems = newData.filter((item) => {
    const nid = normalizeStr(item.id)
    const t = normalizeStr(item.title)

    const hasByOriginalId = nid ? existingOriginalIdSet.has(nid) : false
    const hasByTitle = t ? existingTitleSet.has(t) : false

    return hasByOriginalId || hasByTitle
  })

  return {
    itemsToAdd,
    itemsToRemove,
    unchangedItems
  }
}
