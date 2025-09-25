import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cbetujraqbeegqtjghpl.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZXR1anJhcWJlZWdxdGpnaHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMTA0OTgsImV4cCI6MjA3MzU4NjQ5OH0.CqgOMrgEN4xyE5CZKHy7uuKuEQQcUoHrU-_6L1Dh-Tw'
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function GET() {
  try {
    const supabase = getSupabase()

    // EP 데이터 테이블 확인
    const { data: epData, error: epError, count: epCount } = await supabase
      .from('ep_data')
      .select('id, title', { count: 'exact' })
      .limit(5)

    // 삭제 테이블 확인
    const { data: deleteData, error: deleteError, count: deleteCount } = await supabase
      .from('delete')
      .select('product_id, title', { count: 'exact' })
      .limit(5)

    return NextResponse.json({
      ep_data: {
        count: epCount,
        error: epError,
        sample: epData
      },
      delete: {
        count: deleteCount,
        error: deleteError,
        sample: deleteData
      }
    })

  } catch (error) {
    console.error('DB 테스트 오류:', error)
    return NextResponse.json(
      { error: 'DB 테스트 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
