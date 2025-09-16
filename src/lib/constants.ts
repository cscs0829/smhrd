// 애플리케이션 상수들

export const APP_CONFIG = {
  name: 'EP 자동 삭제 및 추가 시스템',
  version: '1.0.0',
  description: '클릭수가 0인 상품을 자동으로 삭제하고 새로운 상품을 생성하는 스마트한 도구',
  author: 'EP Team',
  url: 'https://ep-auto-delete-add.vercel.app'
} as const

export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['text/csv'],
  allowedExtensions: ['.csv'],
  filenamePattern: /^상품별_\d{8}_\d{8}\.csv$/
} as const

export const PROCESSING_STEPS = [
  {
    id: 1,
    title: 'CSV 파일 업로드',
    description: '클릭수 데이터가 포함된 CSV 파일을 업로드합니다',
    icon: '📁',
    duration: 0
  },
  {
    id: 2,
    title: '0클릭 상품 식별',
    description: '클릭수가 0인 상품 ID들을 자동으로 식별합니다',
    icon: '🔍',
    duration: 1000
  },
  {
    id: 3,
    title: '데이터 백업',
    description: '삭제할 상품을 백업 테이블에 안전하게 저장합니다',
    icon: '💾',
    duration: 1500
  },
  {
    id: 4,
    title: '상품 삭제',
    description: '메인 테이블에서 0클릭 상품들을 삭제합니다',
    icon: '🗑️',
    duration: 2000
  },
  {
    id: 5,
    title: '새 상품 생성',
    description: '새로운 ID, 이미지, GPT 제목으로 상품을 재생성합니다',
    icon: '✨',
    duration: 3000
  },
  {
    id: 6,
    title: '엑셀 내보내기',
    description: '처리 결과를 엑셀 파일로 다운로드합니다',
    icon: '📊',
    duration: 1000
  }
] as const

export const SUPPORTED_TECHNOLOGIES = [
  'Next.js 15',
  'Supabase',
  'OpenAI GPT',
  'LangChain',
  'Tailwind CSS',
  'TypeScript'
] as const

export const SUPPORTED_BROWSERS = [
  'Chrome',
  'Firefox',
  'Safari',
  'Edge'
] as const

export const ERROR_MESSAGES = {
  FILE_TYPE_INVALID: 'CSV 파일만 업로드 가능합니다.',
  FILE_SIZE_EXCEEDED: '파일 크기는 10MB를 초과할 수 없습니다.',
  FILE_NAME_INVALID: '파일명은 "상품별_YYYYMMDD_YYYYMMDD.csv" 형식이어야 합니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  PROCESSING_ERROR: '처리 중 오류가 발생했습니다.',
  NO_ZERO_CLICK_PRODUCTS: '클릭수가 0인 상품이 없습니다.',
  UPLOAD_FAILED: '파일 업로드에 실패했습니다.',
  DOWNLOAD_FAILED: '파일 다운로드에 실패했습니다.'
} as const

export const SUCCESS_MESSAGES = {
  FILE_UPLOADED: '파일이 성공적으로 업로드되었습니다.',
  PROCESSING_COMPLETED: '처리가 성공적으로 완료되었습니다!',
  FILE_DOWNLOADED: '파일이 성공적으로 다운로드되었습니다.',
  DATA_INITIALIZED: '데이터 초기화가 완료되었습니다.'
} as const

export const UI_CONFIG = {
  animationDuration: 300,
  toastDuration: 5000,
  progressUpdateInterval: 100,
  maxRetries: 3
} as const
