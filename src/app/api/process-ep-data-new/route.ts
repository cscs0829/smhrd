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

    // Supabase REST는 기본 max_rows(1000) 제한이 있어 반복 조회로 전체 수집
    const pageSize = 1000
    let from = 0
    const aggregated: Array<{ id: string; original_id?: string | null; title?: string | null; created_at?: string }> = []
    // 안전장치: 최대 100k 행까지만 수집
    const hardLimit = 100_000
    while (aggregated.length < hardLimit) {
      const to = from + pageSize - 1
      const { data: pageData, error: pageError } = await supabase
        .from('ep_data')
        .select('id, original_id, title, created_at')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (pageError) {
        console.error('EP 데이터 페이지 조회 오류:', pageError, { from, to })
        return NextResponse.json({ error: '데이터 조회 중 오류가 발생했습니다' }, { status: 500 })
      }

      if (!pageData || pageData.length === 0) break
      aggregated.push(...pageData)
      if (pageData.length < pageSize) break
      from += pageSize
    }
    
    // 데이터 비교 로직
    const existingData = aggregated
    const comparisonResult = compareEPData(jsonData, existingData || [])

    // 디버그: 수집된 기존 original_id 세트와 엑셀 id 세트의 차집합 측정
    const normalizeStr = (s: unknown): string | null => {
      if (!s) return null
      const str = String(s)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/_+/g, '_')
        .trim()
      if (!str) return null
      return str.normalize('NFC').toLowerCase()
    }
    const collectedExistingIdSet = new Set<string>()
    for (const row of existingData) {
      const oid = normalizeStr((row as any).original_id)
      if (oid) collectedExistingIdSet.add(oid)
    }
    const excelIdList: string[] = []
    for (const row of jsonData) {
      const nid = normalizeStr((row as any).id)
      if (nid) excelIdList.push(nid)
    }
    const missingIds: string[] = []
    for (const nid of excelIdList) {
      if (!collectedExistingIdSet.has(nid)) missingIds.push(nid)
    }

    // 디버그: 세트/카운트 로깅 및 진단 정보 동봉
    console.log('[process-ep-data-new] excel_count:', jsonData.length, 'db_count:', existingData?.length || 0,
      'toAdd:', comparisonResult.itemsToAdd.length,
      'toRemove:', comparisonResult.itemsToRemove.length,
      'unchanged:', comparisonResult.unchangedItems.length)
    if (comparisonResult.itemsToAdd.length > 0) {
      console.log('[process-ep-data-new] sample itemsToAdd ids:', comparisonResult.itemsToAdd.slice(0, 5).map(i => i.id))
    }
    
    const getStrOrNull = (v: unknown): string | null => (v == null ? null : String(v))

    const body = {
      ...comparisonResult,
      // 최상위에 디버그 정보 노출 (일부 뷰어에서 _prefix 숨김 방지)
      excel_count: jsonData.length,
      db_count: existingData?.length || 0,
      to_add: comparisonResult.itemsToAdd.length,
      to_remove: comparisonResult.itemsToRemove.length,
      unchanged_count: comparisonResult.unchangedItems.length,
      sample_to_add: comparisonResult.itemsToAdd.slice(0, 5).map(i => ({ id: i.id, title: i.title })),
      debug_missing_id_count: missingIds.length,
      debug_missing_id_samples: missingIds.slice(0, 10),
      env_supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
      sample_existing: (existingData || []).slice(0, 5).map((row) => {
        const rec = row as Record<string, unknown>
        return {
          original_id: getStrOrNull(rec.original_id),
          title: getStrOrNull(rec.title)
        }
      })
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
    const str = String(s)
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width 제거
      .replace(/\s+/g, ' ') // 다중 공백 축약
      .replace(/_+/g, '_') // 연속 밑줄 축약
      .trim()
    if (!str) return null
    return str.normalize('NFC').toLowerCase()
  }

  // 기존/새 데이터 인덱스 구성 (id 우선, 제목은 보조)
  const existingOriginalIdSet = new Set<string>()
  const existingTitleSet = new Set<string>()
  for (const item of existingData) {
    const oid = normalizeStr(item.original_id)
    if (oid) existingOriginalIdSet.add(oid)
    const t = normalizeStr(item.title)
    if (t) existingTitleSet.add(t)
  }

  const newOriginalIdSet = new Set<string>()
  const newTitleSet = new Set<string>()
  for (const item of newData) {
    const nid = normalizeStr(item.id)
    if (nid) newOriginalIdSet.add(nid)
    const t = normalizeStr(item.title)
    if (t) newTitleSet.add(t)
  }

  // 규칙
  // 1) 양쪽 모두 id가 있는 경우: id로만 판단
  // 2) 한쪽이라도 id가 없는 경우에만 title 보조 판단
  const itemsToAdd = newData.filter((item) => {
    const nid = normalizeStr(item.id)
    const t = normalizeStr(item.title)

    if (nid) {
      // id가 있으면 id로만 판단
      return !existingOriginalIdSet.has(nid)
    }
    // id가 없으면 제목으로 보조 판단
    return t ? !existingTitleSet.has(t) : true
  })

  const itemsToRemove = existingData.filter((item) => {
    const oid = normalizeStr(item.original_id)
    const t = normalizeStr(item.title)

    if (oid) {
      // id가 있으면 id로만 판단
      return !newOriginalIdSet.has(oid)
    }
    // id가 없으면 제목으로 보조 판단
    return t ? !newTitleSet.has(t) : true
  })

  const unchangedItems = newData.filter((item) => {
    const nid = normalizeStr(item.id)
    const t = normalizeStr(item.title)

    if (nid) {
      return existingOriginalIdSet.has(nid)
    }
    return t ? existingTitleSet.has(t) : false
  })

  return {
    itemsToAdd,
    itemsToRemove,
    unchangedItems
  }
}
