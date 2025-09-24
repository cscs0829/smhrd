import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { TABLE_NAMES, type DatabaseStatus } from '@/types/database'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    // 각 테이블의 개수 조회
    const [epDataCount, deletedItemsCount, apiKeysCount, cityImagesCount, titlesCount] = await Promise.all([
      supabase.from(TABLE_NAMES.EP_DATA).select('id', { count: 'exact', head: true }),
      supabase.from(TABLE_NAMES.DELETED_ITEMS).select('id', { count: 'exact', head: true }),
      supabase.from(TABLE_NAMES.API_KEYS).select('id', { count: 'exact', head: true }),
      supabase.from(TABLE_NAMES.CITY_IMAGES).select('id', { count: 'exact', head: true }),
      supabase.from(TABLE_NAMES.TITLES).select('id', { count: 'exact', head: true })
    ])

    // 최근 데이터 조회
    const [recentEpData, recentDeletedItems, recentApiKeys, recentCityImages, recentTitles] = await Promise.all([
      supabase
        .from(TABLE_NAMES.EP_DATA)
        .select('id, title, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from(TABLE_NAMES.DELETED_ITEMS)
        .select('id, original_id, original_data, reason, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from(TABLE_NAMES.API_KEYS)
        .select('id, provider, name, is_active, created_at, last_used_at, usage_count, api_key')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from(TABLE_NAMES.CITY_IMAGES)
        .select('id, city, image_link, is_main_image, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from(TABLE_NAMES.TITLES)
        .select('id, title, city, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    // 연결 상태 확인
    const connectionStatus = epDataCount.error ? 'error' : 'connected'

    const response: DatabaseStatus = {
      connectionStatus,
      tableCounts: {
        ep_data: epDataCount.count || 0,
        deleted_items: deletedItemsCount.count || 0,
        api_keys: apiKeysCount.count || 0,
        city_images: cityImagesCount.count || 0,
        titles: titlesCount.count || 0
      },
      recentData: {
        ep_data: recentEpData.data || [],
        deleted_items: recentDeletedItems.data || [],
        api_keys: recentApiKeys.data || [],
        city_images: recentCityImages.data || [],
        titles: recentTitles.data || []
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('데이터베이스 상태 조회 오류:', error)
    
    const errorResponse: DatabaseStatus = {
      connectionStatus: 'error',
      tableCounts: {
        ep_data: 0,
        deleted_items: 0,
        api_keys: 0,
        city_images: 0,
        titles: 0
      },
      recentData: {
        ep_data: [],
        deleted_items: [],
        api_keys: [],
        city_images: [],
        titles: []
      }
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
