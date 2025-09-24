import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // 각 테이블의 개수 조회
    const [epDataCount, deleteCount, apiKeysCount] = await Promise.all([
      supabase.from('ep_data').select('id', { count: 'exact', head: true }),
      supabase.from('delete').select('id', { count: 'exact', head: true }),
      supabase.from('api_keys').select('id', { count: 'exact', head: true })
    ])

    // 최근 데이터 조회
    const [recentEpData, recentDeleteData, recentApiKeys] = await Promise.all([
      supabase
        .from('ep_data')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('delete')
        .select('id, product_id, title, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('api_keys')
        .select('id, provider, name, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    // 연결 상태 확인
    const connectionStatus = epDataCount.error ? 'error' : 'connected'

    return NextResponse.json({
      connectionStatus,
      tableCounts: {
        ep_data: epDataCount.count || 0,
        delete: deleteCount.count || 0,
        api_keys: apiKeysCount.count || 0
      },
      recentData: {
        ep_data: recentEpData.data || [],
        delete: recentDeleteData.data || [],
        api_keys: recentApiKeys.data || []
      }
    })

  } catch (error) {
    console.error('데이터베이스 상태 조회 오류:', error)
    return NextResponse.json(
      { 
        connectionStatus: 'error',
        tableCounts: {
          ep_data: 0,
          delete: 0,
          api_keys: 0
        },
        recentData: {
          ep_data: [],
          delete: [],
          api_keys: []
        }
      },
      { status: 500 }
    )
  }
}
