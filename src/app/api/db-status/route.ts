import { NextResponse } from 'next/server'
import { getSupabaseClient, getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const adminSupabase = getSupabaseAdmin()

    // 각 테이블의 데이터 개수 확인
    const [epDataResult, cityImagesResult, titlesResult, apiKeysResult, deletedItemsResult] = await Promise.all([
      supabase.from('ep_data').select('id', { count: 'exact', head: true }),
      supabase.from('city_images').select('id', { count: 'exact', head: true }),
      supabase.from('titles').select('id', { count: 'exact', head: true }),
      adminSupabase.from('api_keys').select('id', { count: 'exact', head: true }),
      adminSupabase.from('deleted_items').select('id', { count: 'exact', head: true })
    ])

    // 최근 데이터 샘플 가져오기
    const [recentEpData, recentCityImages, recentApiKeys] = await Promise.all([
      supabase.from('ep_data').select('id, title, city, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('city_images').select('id, city, image_link, is_main_image').order('created_at', { ascending: false }).limit(5),
      adminSupabase.from('api_keys').select('id, provider, name, is_active, created_at').order('created_at', { ascending: false }).limit(5)
    ])

    return NextResponse.json({
      success: true,
      data: {
        tableCounts: {
          ep_data: epDataResult.count || 0,
          city_images: cityImagesResult.count || 0,
          titles: titlesResult.count || 0,
          api_keys: apiKeysResult.count || 0,
          deleted_items: deletedItemsResult.count || 0
        },
        recentData: {
          ep_data: recentEpData.data || [],
          city_images: recentCityImages.data || [],
          api_keys: recentApiKeys.data || []
        },
        connectionStatus: 'connected'
      }
    })
  } catch (error: unknown) {
    console.error('데이터베이스 상태 확인 오류:', error)
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ 
      success: false, 
      error: message,
      data: {
        connectionStatus: 'error'
      }
    }, { status: 500 })
  }
}
