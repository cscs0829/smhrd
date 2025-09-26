import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// createClient를 직접 export
export { createClient }

export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 클라이언트 환경변수가 설정되지 않았습니다.')
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export function getSupabaseAdmin(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase Admin 환경변수가 설정되지 않았습니다.')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface EpData {
  id: string
  original_id?: string | null
  title: string
  price_pc: number
  benefit_price: number
  normal_price: number
  link: string
  mobile_link: string
  image_link: string
  add_image_link: string
  video_url: string
  category_name1: string
  category_name2: string
  category_name3: string
  category_name4: string
  brand: string
  maker: string
  origin: string
  age_group: string
  gender: string
  city: string
  created_at: string
  updated_at: string
}

export interface CityImage {
  city: string
  image_link: string
  메인이미지인지아닌지: number
  video_url: string
}

export interface DeletedItem {
  id: string
  original_data: EpData
  deleted_at: string
  reason: string
}

export interface ProductClickData {
  상품ID: string
  상품명: string
  노출수: number
  클릭수: number
  클릭율: number
  CPC적용수수료: number
  CPC클릭당수수료: number
}
