import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: '유효하지 않은 데이터입니다' }, { status: 400 })
    }

    // RLS 무시를 위해 관리자 클라이언트 사용
    const supabase = getSupabaseAdmin()
    
    // Excel 데이터를 ep_data 테이블 구조에 맞게 변환
    const transformedItems = items.map(item => {
      const transformed = { ...item }
      
      // Excel의 id를 original_id로 이동
      if (transformed.id) {
        transformed.original_id = transformed.id
        delete transformed.id // UUID가 자동 생성되도록 id 삭제
      }
      
      // created_at, updated_at는 자동 생성되므로 제거
      delete transformed.created_at
      delete transformed.updated_at
      
      return transformed
    })
    
    // 중복 방지: 이미 존재하는 original_id 선제 제거 후 insert
    const idsToInsert = Array.from(new Set(
      transformedItems
        .map((it: { original_id?: unknown }) => (it?.original_id != null ? String(it.original_id) : null))
        .filter((v: string | null): v is string => Boolean(v))
    ))

    const existing = new Set<string>()
    if (idsToInsert.length > 0) {
      const chunkSize = 1000
      for (let i = 0; i < idsToInsert.length; i += chunkSize) {
        const chunk = idsToInsert.slice(i, i + chunkSize)
        const { data: hit, error: hitErr } = await supabase
          .from('ep_data')
          .select('original_id')
          .in('original_id', chunk)
        if (hitErr) {
          console.error('기존 확인 오류:', hitErr)
          return NextResponse.json({ error: '데이터 저장 중 오류가 발생했습니다', detail: hitErr.message }, { status: 500 })
        }
        if (hit) {
          for (const r of hit as Array<{ original_id: string | null }>) {
            if (r?.original_id) existing.add(String(r.original_id))
          }
        }
      }
    }

    const toInsert = transformedItems.filter((it: { original_id?: unknown }) => {
      const raw = it?.original_id != null ? String(it.original_id) : null
      return raw ? !existing.has(raw) : true
    })

    if (toInsert.length === 0) {
      return NextResponse.json({ success: true, message: '추가할 새로운 항목이 없습니다', data: [] })
    }

    const { data, error } = await supabase
      .from('ep_data')
      .insert(toInsert)
      .select()

    if (error) {
      console.error('데이터 저장 오류:', error)
      const detailMsg = (error as { message?: string } | null)?.message || String(error)
      return NextResponse.json({ error: '데이터 저장 중 오류가 발생했습니다', detail: detailMsg }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${toInsert.length}개의 새로운 데이터가 저장되었습니다`,
      data 
    })
  } catch (error) {
    console.error('새로운 EP 데이터 저장 오류:', error)
    const detail = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: '데이터 저장 중 오류가 발생했습니다', detail },
      { status: 500 }
    )
  }
}
