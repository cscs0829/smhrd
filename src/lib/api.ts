// API 관련 유틸리티 함수들

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ProcessResult {
  success: boolean
  message: string
  downloadUrl?: string
  processedCount?: number
  deletedCount?: number
  createdCount?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function processFile(file: File): Promise<ProcessResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/process', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || '처리 중 오류가 발생했습니다.',
        response.status,
        errorData.code
      )
    }

    // 파일 다운로드 처리
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    
    return {
      success: true,
      message: '처리가 성공적으로 완료되었습니다!',
      downloadUrl: url
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError(
      '네트워크 오류가 발생했습니다.',
      0,
      'NETWORK_ERROR'
    )
  }
}

export async function initializeData(type: 'ep_data' | 'city_images'): Promise<void> {
  try {
    const response = await fetch('/api/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: type })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || '데이터 초기화 중 오류가 발생했습니다.',
        response.status,
        errorData.code
      )
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    throw new ApiError(
      '네트워크 오류가 발생했습니다.',
      0,
      'NETWORK_ERROR'
    )
  }
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // 메모리 정리
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function validateCsvFile(file: File): { valid: boolean; error?: string } {
  // 파일 타입 검증
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return {
      valid: false,
      error: 'CSV 파일만 업로드 가능합니다.'
    }
  }

  // 파일 크기 검증 (10MB 제한)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '파일 크기는 10MB를 초과할 수 없습니다.'
    }
  }

  // 파일명 패턴 검증 (상품별_YYYYMMDD_YYYYMMDD.csv)
  const filenamePattern = /^상품별_\d{8}_\d{8}\.csv$/
  if (!filenamePattern.test(file.name)) {
    return {
      valid: false,
      error: '파일명은 "상품별_YYYYMMDD_YYYYMMDD.csv" 형식이어야 합니다.'
    }
  }

  return { valid: true }
}

export interface ApiKey {
  id: number
  name: string
  key: string
  provider: 'openai' | 'gemini'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getApiKeyById(id: number): Promise<ApiKey | null> {
  try {
    const response = await fetch('/api/api-keys')
    if (!response.ok) {
      throw new Error('API 키를 가져올 수 없습니다.')
    }
    
    const data = await response.json()
    const apiKeys = data.data || [] // api-keys 엔드포인트는 { data } 형식으로 반환
    
    return apiKeys.find((key: ApiKey) => key.id === id) || null
  } catch (error) {
    console.error('API 키 조회 오류:', error)
    return null
  }
}
