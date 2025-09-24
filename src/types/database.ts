// 데이터베이스 타입 정의
export interface EpData {
  id: string
  title: string
  price_pc?: number
  benefit_price?: number
  normal_price?: number
  link?: string
  mobile_link?: string
  image_link?: string
  add_image_link?: string
  video_url?: string
  category_name1?: string
  category_name2?: string
  category_name3?: string
  category_name4?: string
  brand?: string
  maker?: string
  origin?: string
  age_group?: string
  gender?: string
  city?: string
  created_at: string
  updated_at: string
}

export interface DeletedItem {
  id: number
  original_id: string
  original_data: EpData
  reason?: string
  created_at: string
}

export interface ApiKey {
  id: number
  provider: 'openai' | 'gemini'
  name: string
  description?: string
  api_key: string
  is_active: boolean
  created_at: string
  last_used_at?: string
  usage_count: number
}

export interface CityImage {
  id: number
  city: string
  image_link: string
  is_main_image: number
  video_url?: string
  created_at: string
}

export interface Title {
  id: string
  title: string
  city?: string
  created_at: string
}

export interface AiModelSettings {
  id: number
  default_model: string
  temperature: number
  max_tokens: number
  updated_at: string
}

// 데이터베이스 상태 타입
export interface DatabaseStatus {
  connectionStatus: 'connected' | 'error'
  tableCounts: {
    ep_data: number
    deleted_items: number
    api_keys: number
    city_images: number
    titles: number
  }
  recentData: {
    ep_data: EpData[]
    deleted_items: DeletedItem[]
    api_keys: ApiKey[]
    city_images: CityImage[]
    titles: Title[]
  }
}

// 테이블 이름 상수
export const TABLE_NAMES = {
  EP_DATA: 'ep_data',
  DELETED_ITEMS: 'deleted_items',
  API_KEYS: 'api_keys',
  CITY_IMAGES: 'city_images',
  TITLES: 'titles'
} as const

export type TableName = typeof TABLE_NAMES[keyof typeof TABLE_NAMES]
