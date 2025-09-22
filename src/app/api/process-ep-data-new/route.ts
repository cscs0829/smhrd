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
    let comparisonResult = compareEPData(jsonData, existingData || [])

    // 최종 보정: DB 존재 여부로 ID만으로 unchanged 강제 허용 (정확 일치)
    // - 세트 불일치나 정규화 오탐이 남는 경우를 방지하기 위한 안전장치
    const excelIdCandidates: string[] = Array.from(new Set(
      (comparisonResult.debug_new_id_exact || []).filter((v: string) => !!v)
    ))
    const presentInDb = new Set<string>()
    if (excelIdCandidates.length > 0) {
      const chunkSize = 1000
      for (let i = 0; i < excelIdCandidates.length; i += chunkSize) {
        const chunk = excelIdCandidates.slice(i, i + chunkSize)
        const { data: hit } = await supabase
          .from('ep_data')
          .select('original_id')
          .in('original_id', chunk)
        if (hit) {
          for (const r of hit) {
            if (r && r.original_id) presentInDb.add(String(r.original_id))
          }
        }
      }
    }
    if (presentInDb.size > 0) {
      const itemsToAddFinal = comparisonResult.itemsToAdd.filter((item) => {
        const id = item.id ? String(item.id) : null
        if (!id) return true
        return !presentInDb.has(id)
      })
      const movedToUnchanged = comparisonResult.itemsToAdd.filter((item) => {
        const id = item.id ? String(item.id) : null
        return !!(id && presentInDb.has(id))
      })
      const unchangedFinal = [...comparisonResult.unchangedItems, ...movedToUnchanged]
      comparisonResult = {
        ...comparisonResult,
        itemsToAdd: itemsToAddFinal,
        unchangedItems: unchangedFinal
      }
    }

    // 디버그 및 원인 진단: 비교와 동일한 정규화 규칙 사용
    const normalizeId = (s: unknown): string | null => {
      if (s == null) return null
      const str = String(s)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/_+/g, '_')
        .trim()
      if (!str) return null
      return str.normalize('NFC')
    }
    const normalizeIdLoose = (s: unknown): string | null => {
      const v = normalizeId(s)
      return v ? v.toLowerCase() : null
    }
    const normalizeIdUltraLoose = (s: unknown): string | null => {
      if (s == null) return null
      const str = String(s)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .normalize('NFKC')
        .replace(/[^0-9A-Za-z]+/g, '_')
        .replace(/_+/g, '_')
        .trim()
      if (!str) return null
      return str.normalize('NFC').toLowerCase()
    }
    const normalizeTitle = (s: unknown): string | null => {
      if (s == null) return null
      const str = String(s)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .normalize('NFKC')
        .replace(/[\p{P}\p{S}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (!str) return null
      return str.normalize('NFC').toLowerCase()
    }

    // compareEPData에서 반환한 세트를 그대로 사용하여 일관성 확보
    const existingIdExact = new Set<string>(comparisonResult.debug_existing_id_exact || [])
    const existingIdLoose = new Set<string>(comparisonResult.debug_existing_id_loose || [])
    const existingIdUltra = new Set<string>(comparisonResult.debug_existing_id_ultra || [])
    const existingTitle = new Set<string>(comparisonResult.debug_existing_title || [])
    // 기존 데이터의 (ultra 정규화된 original_id) -> (정규화된 title) 맵 구성
    const dbUltraIdToNormTitle = new Map<string, string>()
    for (const row of existingData) {
      const oidUltra = normalizeIdUltraLoose(row.original_id)
      const tNorm = normalizeTitle(row.title)
      if (oidUltra && tNorm) {
        if (!dbUltraIdToNormTitle.has(oidUltra)) dbUltraIdToNormTitle.set(oidUltra, tNorm)
      }
    }

    const excelIdLooseList: string[] = comparisonResult.debug_new_id_loose || []

    const missingIds: string[] = []
    for (const nidLoose of excelIdLooseList) {
      if (!existingIdLoose.has(nidLoose)) missingIds.push(nidLoose)
    }

    // why_to_add: 각 추가 대상에 대해 어떤 기준이 불일치했는지 표기
    const whyToAdd = (comparisonResult.itemsToAdd || []).map((item) => {
      const nid = normalizeId(item.id)
      const nidLoose = normalizeIdLoose(item.id)
      const nidUltra = normalizeIdUltraLoose(item.id)
      const t = normalizeTitle(item.title)
      const titleMatch = t ? existingTitle.has(t) : false
      const idExactMatch = nid ? existingIdExact.has(nid) : false
      const idLooseMatch = nidLoose ? existingIdLoose.has(nidLoose) : false
      const dbTitleForId = nidUltra ? (dbUltraIdToNormTitle.get(nidUltra) || null) : null
      const titleEqual = t && dbTitleForId ? t === dbTitleForId : null
      return {
        id: item.id ?? null,
        title: item.title ?? null,
        title_match: titleMatch,
        id_exact_match: idExactMatch,
        id_loose_match: idLooseMatch,
        id_ultra_match: nidUltra ? (existingIdUltra.has(nidUltra) || existingIdExact.has(nidUltra) || existingIdLoose.has(nidUltra)) : false,
        excel_id_normalized_ultra: nidUltra,
        excel_title_normalized: t ?? null,
        db_title_normalized_for_id: dbTitleForId,
        title_equal: titleEqual
      }
    })

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
      why_to_add: whyToAdd,
      commit_sha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT_SHA || 'unknown',
      id_normalization: 'exact_case_preserved_underscore_preserved',
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
    '상품코드': 'id', '상품 코드': 'id', 'excel id': 'id', 'Excel ID': 'id', 'original id': 'id', 'Original ID': 'id', '원본ID': 'id',
    // title 계열
    'title': 'title', 'TITLE': 'title', '제목': 'title', '상품명': 'title', '상품 명': 'title', '상품명(제목)': 'title'
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
    // 빈 문자열은 null 처리하여 비교 시 잡음 제거
    if (typeof normalized['id'] === 'string' && (normalized['id'] as string).trim() === '') {
      delete normalized['id']
    }
    if (typeof normalized['title'] === 'string' && (normalized['title'] as string).trim() === '') {
      delete normalized['title']
    }
    return normalized as { id?: string; title?: string; [key: string]: unknown }
  })
}

function compareEPData(
  newData: Array<{ id?: string; title?: string; [key: string]: unknown }>,
  existingData: Array<{ id: string; original_id?: string | null; title?: string | null; [key: string]: unknown }>
) {
  // ID와 제목은 서로 다른 정규화 규칙을 적용한다.
  // - ID: 대소문자는 보존, 연속 밑줄은 1개로 축약(표기 차이 허용), zero-width 제거 및 trim
  // - Title: 공백 축약 및 소문자화로 유사 문자열 흡수
  const normalizeId = (s: unknown): string | null => {
    if (s == null) return null
    const str = String(s)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/_+/g, '_')
      .trim()
    if (!str) return null
    return str.normalize('NFC')
  }
  const normalizeIdLoose = (s: unknown): string | null => {
    const v = normalizeId(s)
    return v ? v.toLowerCase() : null
  }
  const normalizeIdUltraLoose = (s: unknown): string | null => {
    if (s == null) return null
    const str = String(s)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .normalize('NFKC')
      .replace(/[^0-9A-Za-z]+/g, '_')
      .replace(/_+/g, '_')
      .trim()
    if (!str) return null
    return str.normalize('NFC').toLowerCase()
  }
  const normalizeTitle = (s: unknown): string | null => {
    if (s == null) return null
    const str = String(s)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .normalize('NFKC')
      .replace(/[\p{P}\p{S}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!str) return null
    return str.normalize('NFC').toLowerCase()
  }

  // 기존/새 데이터 인덱스 구성 (제목 우선, ID 보조)
  const existingOriginalIdSet = new Set<string>()
  const existingOriginalIdLooseSet = new Set<string>()
  const existingOriginalIdUltraLooseSet = new Set<string>()
  const existingTitleSet = new Set<string>()
  for (const item of existingData) {
    const oid = normalizeId(item.original_id)
    if (oid) existingOriginalIdSet.add(oid)
    const oidLoose = normalizeIdLoose(item.original_id)
    if (oidLoose) existingOriginalIdLooseSet.add(oidLoose)
    const oidUltra = normalizeIdUltraLoose(item.original_id)
    if (oidUltra) existingOriginalIdUltraLooseSet.add(oidUltra)
    const t = normalizeTitle(item.title)
    if (t) existingTitleSet.add(t)
  }

  const newOriginalIdSet = new Set<string>()
  const newOriginalIdLooseSet = new Set<string>()
  const newOriginalIdUltraLooseSet = new Set<string>()
  const newTitleSet = new Set<string>()
  for (const item of newData) {
    const nid = normalizeId(item.id)
    if (nid) newOriginalIdSet.add(nid)
    const nidLoose = normalizeIdLoose(item.id)
    if (nidLoose) newOriginalIdLooseSet.add(nidLoose)
    const nidUltra = normalizeIdUltraLoose(item.id)
    if (nidUltra) newOriginalIdUltraLooseSet.add(nidUltra)
    const t = normalizeTitle(item.title)
    if (t) newTitleSet.add(t)
  }

  // 규칙 (요청 반영: 제목 우선, ID 보조)
  const itemsToAdd = newData.filter((item) => {
    const nid = normalizeId(item.id)
    const t = normalizeTitle(item.title)

    // 제목 기준 우선 판단
    if (t && existingTitleSet.has(t)) return false
    // ID로만 동일 판단을 허용 (요청 옵션) - exact/loose/ultra 중 하나라도 매칭되면 추가 아님
    if (nid) {
      const nidLoose = normalizeIdLoose(item.id)
      const nidUltra = normalizeIdUltraLoose(item.id)
      if (existingOriginalIdSet.has(nid)) return false
      if (nidLoose && existingOriginalIdLooseSet.has(nidLoose)) return false
      if (nidUltra && existingOriginalIdUltraLooseSet.has(nidUltra)) return false
    }
    // 제목/ID 모두 불일치 → 추가 대상
    return true
  })

  const itemsToRemove = existingData.filter((item) => {
    const oid = normalizeId(item.original_id)
    const t = normalizeTitle(item.title)

    // 제목 기준 우선 판단 (제목이 새 데이터에 있으면 제거 아님)
    if (t && newTitleSet.has(t)) return false
    // 제목으로도 매칭되지 않을 때만 ID 보조 판단
    if (oid) {
      const oidLoose = normalizeIdLoose(item.original_id)
      const oidUltra = normalizeIdUltraLoose(item.original_id)
      const presentExact = newOriginalIdSet.has(oid)
      const presentLoose = oidLoose ? newOriginalIdLooseSet.has(oidLoose) : false
      const presentUltra = oidUltra ? newOriginalIdUltraLooseSet.has(oidUltra) : false
      if (presentExact || presentLoose || presentUltra) return false
    }
    // 제목도 없고 ID도 없거나 모두 불일치면 제거 대상으로 간주
    return true
  })

  const unchangedItems = newData.filter((item) => {
    const nid = normalizeId(item.id)
    const t = normalizeTitle(item.title)

    // 제목으로 동일
    if (t && existingTitleSet.has(t)) return true
    // ID로 동일 (요청 옵션: ID만으로 unchanged 허용)
    if (nid) {
      const nidLoose = normalizeIdLoose(item.id)
      const nidUltra = normalizeIdUltraLoose(item.id)
      if (existingOriginalIdSet.has(nid)) return true
      if (nidLoose && existingOriginalIdLooseSet.has(nidLoose)) return true
      if (nidUltra && existingOriginalIdUltraLooseSet.has(nidUltra)) return true
    }
    return false
  })

  return {
    itemsToAdd,
    itemsToRemove,
    unchangedItems,
    debug_existing_id_exact: Array.from(existingOriginalIdSet),
    debug_existing_id_loose: Array.from(existingOriginalIdLooseSet),
    debug_existing_id_ultra: Array.from(existingOriginalIdUltraLooseSet),
    debug_existing_title: Array.from(existingTitleSet),
    debug_new_id_exact: Array.from(newOriginalIdSet),
    debug_new_id_loose: Array.from(newOriginalIdLooseSet),
    debug_new_id_ultra: Array.from(newOriginalIdUltraLooseSet),
    debug_new_title: Array.from(newTitleSet)
  }
}
