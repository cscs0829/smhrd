import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

// 허용 테이블은 타입 정의와 일치시킨다
const ALLOWED_TABLES = ['ep_data', 'delect', 'api', 'city_images', 'titles'] as const
type AllowedTable = typeof ALLOWED_TABLES[number]

export async function POST(req: NextRequest) {
  try {
    const { table } = (await req.json()) as { table?: AllowedTable }

    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: '허용되지 않은 테이블입니다.' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Supabase JS는 TRUNCATE를 직접 제공하지 않으므로 RPC나 raw SQL을 사용
    // 여기서는 보안상 대상 테이블을 화이트리스트로 제한하여 raw SQL 실행
    const tableIdent = table

    const { error } = await supabase.rpc('exec_sql', { sql: `TRUNCATE TABLE ${tableIdent} RESTART IDENTITY CASCADE;` })

    if (error) {
      // 만약 exec_sql 함수가 없다면 에러가 발생한다. 이 경우 대안으로 delete * 수행
      console.warn('exec_sql RPC 실패, delete로 대체 시도:', error.message)
      const { error: delError } = await supabase.from(tableIdent).delete().neq('id', null)
      if (delError) {
        console.error('전체 삭제 실패:', delError)
        return NextResponse.json({ error: '전체 삭제 실패' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('truncate-table 오류:', e)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}


