import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: '서버 환경변수가 설정되지 않았습니다.' }, { status: 500 })
    }
    const supabase = createClient(supabaseUrl, supabaseKey)

    const tables = ['ep_data', 'delect', 'api'] as const

    const counts: Record<string, number> = {}

    for (const t of tables) {
      const { count, error } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true })
      if (error) {
        console.error(`Count error for ${t}:`, error)
        counts[t] = 0
      } else {
        counts[t] = count ?? 0
      }
    }

    return NextResponse.json({ success: true, counts })
  } catch (error) {
    console.error('Count API error:', error)
    return NextResponse.json({ error: '카운트 조회 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
