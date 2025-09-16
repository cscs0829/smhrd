import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { getSupabaseAdmin } from '@/lib/supabase'

// 관리자 토큰 및 프로덕션 가드
function isAllowed(request: NextRequest): boolean {
  const adminToken = process.env.ADMIN_TOKEN
  const headerToken = request.headers.get('x-admin-token')
  if (!adminToken || headerToken !== adminToken) return false
  // 프로덕션에서는 명시적 허용 플래그 필요
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_IMPORT !== 'true') return false
  return true
}

// 파일 후보 목록 (한글 정규/분해형 파일명 포함)
const CANDIDATE_FILES = [
  'ep데이터.xlsx',
  'ep데이터.xlsx',
  'EP데이터.xlsx',
]

// 헤더 매핑 (한글 → DB 컬럼)
const headerMap: Record<string, string> = {
  '상품ID': 'id',
  '상품명': 'title',
  'PC가격': 'price_pc',
  '혜택가': 'benefit_price',
  '정가': 'normal_price',
  '링크': 'link',
  '모바일링크': 'mobile_link',
  '이미지링크': 'image_link',
  '추가이미지링크': 'add_image_link',
  '동영상URL': 'video_url',
  '카테고리1': 'category_name1',
  '카테고리2': 'category_name2',
  '카테고리3': 'category_name3',
  '카테고리4': 'category_name4',
  '브랜드': 'brand',
  '제조사': 'maker',
  '원산지': 'origin',
  '연령대': 'age_group',
  '성별': 'gender',
  '도시': 'city',
}

function normalizeHeader(h: string): string {
  const trimmed = String(h || '').trim()
  if (headerMap[trimmed]) return headerMap[trimmed]
  // 이미 영문 스키마면 그대로
  return trimmed
}

function findExcelPath(): string | null {
  for (const name of CANDIDATE_FILES) {
    const p = path.join(process.cwd(), name)
    if (fs.existsSync(p)) return p
    const inPublic = path.join(process.cwd(), 'public', name)
    if (fs.existsSync(inPublic)) return inPublic
  }
  // 폴더 내 임의 xlsx 중 ep 키워드 포함 파일 검색 (최초 1개)
  const files = fs.readdirSync(process.cwd()).filter(f => /ep.*\.xlsx$/i.test(f))
  if (files.length) return path.join(process.cwd(), files[0])
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowed(request)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 })
    }

    const excelPath = findExcelPath()
    if (!excelPath) {
      return NextResponse.json({ success: false, message: '엑셀 파일을 찾을 수 없습니다.' }, { status: 404 })
    }

    const workbook = XLSX.readFile(excelPath)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false })

    if (!rows.length) {
      return NextResponse.json({ success: false, message: '엑셀에 데이터가 없습니다.' }, { status: 400 })
    }

    // 헤더 정규화 및 데이터 변환
    const normalized = rows.map((row) => {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(row)) {
        const nk = normalizeHeader(k)
        out[nk] = v
      }
      // 필수 기본값 채우기
      if (out['id']) out['id'] = String(out['id'])
      if (out['price_pc'] != null) out['price_pc'] = Number(out['price_pc'])
      if (out['benefit_price'] != null) out['benefit_price'] = Number(out['benefit_price'])
      if (out['normal_price'] != null) out['normal_price'] = Number(out['normal_price'])
      return out
    })

    // id 없는 행 제거
    const validRows = normalized.filter(r => r['id'])
    if (!validRows.length) {
      return NextResponse.json({ success: false, message: '유효한 ID가 있는 행이 없습니다.' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // 배치 업서트
    const chunkSize = 1000
    for (let i = 0; i < validRows.length; i += chunkSize) {
      const chunk = validRows.slice(i, i + chunkSize)
      const { error } = await supabase
        .from('ep_data')
        .upsert(chunk, { onConflict: 'id' })
      if (error) throw error
    }

    return NextResponse.json({ success: true, message: 'EP 데이터 업서트 완료', count: validRows.length })
  } catch (error: unknown) {
    console.error('EP 임포트 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}


