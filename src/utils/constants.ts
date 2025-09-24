/**
 * 애플리케이션 전역 상수 정의
 * 설정값, 메시지, 설정 등을 중앙화
 */

// ===== API 관련 상수 =====
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

// ===== 파일 처리 관련 상수 =====
export const FILE_CONFIG = {
  MAX_SIZE_MB: 10,
  ALLOWED_CSV_TYPES: ['text/csv', 'application/vnd.ms-excel'] as const,
  ALLOWED_EXCEL_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ] as const,
  CHUNK_SIZE: 1024 * 1024, // 1MB
  ENCODING: 'utf-8'
} as const;

// ===== 데이터 검증 관련 상수 =====
export const VALIDATION_CONFIG = {
  MIN_ITEMS: 5,
  MAX_ITEMS: 11,
  MIN_ADD_ITEMS: 5,
  MAX_ADD_ITEMS: 10,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 500,
  MIN_ID_LENGTH: 1,
  MAX_ID_LENGTH: 100
} as const;

// ===== UI 관련 상수 =====
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TABLE_PAGE_SIZE: 10,
  MAX_PREVIEW_ROWS: 5
} as const;

// ===== 메시지 상수 =====
export const MESSAGES = {
  SUCCESS: {
    FILE_UPLOADED: '파일이 성공적으로 업로드되었습니다',
    DATA_SAVED: '데이터가 성공적으로 저장되었습니다',
    DATA_DELETED: '데이터가 성공적으로 삭제되었습니다',
    PROCESS_COMPLETED: '처리가 완료되었습니다',
    OPERATION_SUCCESS: '작업이 성공적으로 완료되었습니다'
  },
  ERROR: {
    NETWORK_ERROR: '네트워크 연결을 확인해주세요',
    SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요',
    FILE_TOO_LARGE: `파일 크기는 ${FILE_CONFIG.MAX_SIZE_MB}MB 이하여야 합니다`,
    INVALID_FILE_TYPE: '지원되지 않는 파일 형식입니다',
    REQUIRED_FIELD: '필수 입력 항목입니다',
    INVALID_FORMAT: '올바른 형식이 아닙니다',
    DUPLICATE_ITEM: '중복된 항목이 있습니다',
    OPERATION_FAILED: '작업 처리 중 오류가 발생했습니다'
  },
  WARNING: {
    UNSAVED_CHANGES: '저장되지 않은 변경사항이 있습니다',
    CONFIRM_DELETE: '정말로 삭제하시겠습니까?',
    DATA_LOSS: '이 작업은 되돌릴 수 없습니다',
    LIMIT_EXCEEDED: '제한을 초과했습니다'
  },
  INFO: {
    LOADING: '처리 중입니다...',
    PROCESSING: '데이터를 처리하고 있습니다',
    UPLOADING: '파일을 업로드하고 있습니다',
    SAVING: '저장하고 있습니다',
    NO_DATA: '데이터가 없습니다',
    SEARCHING: '검색하고 있습니다'
  }
} as const;

// ===== 테이블 헤더 상수 =====
export const TABLE_HEADERS = {
  EP_DATA: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'title', label: '제목', sortable: true },
    { key: 'created_at', label: '생성일', sortable: true }
  ] as const,
  DELETE_ITEMS: [
    { key: 'product_id', label: '상품ID', sortable: true },
    { key: 'title', label: '제목', sortable: true },
    { key: 'reason', label: '삭제 이유', sortable: false },
    { key: 'created_at', label: '삭제일', sortable: true }
  ] as const,
  CLICK_DATA: [
    { key: 'productId', label: '상품ID', sortable: true },
    { key: 'productName', label: '상품명', sortable: true },
    { key: 'clicks', label: '클릭수', sortable: true }
  ] as const
} as const;

// ===== 드롭존 메시지 상수 =====
export const DROPZONE_MESSAGES = {
  CSV: {
    DRAG_ACTIVE: 'CSV 파일을 여기에 놓으세요...',
    DRAG_INACTIVE: 'CSV 파일을 드래그하거나 클릭하여 선택',
    FILE_TYPE_HINT: '.csv 파일만 지원'
  },
  EXCEL: {
    DRAG_ACTIVE: '엑셀 파일을 여기에 놓으세요...',
    DRAG_INACTIVE: '엑셀 파일을 드래그하거나 클릭하여 선택',
    FILE_TYPE_HINT: '.xlsx, .xls 파일만 지원'
  },
  GENERIC: {
    DRAG_ACTIVE: '파일을 여기에 놓으세요...',
    DRAG_INACTIVE: '파일을 드래그하거나 클릭하여 선택',
    FILE_TYPE_HINT: '지원되는 파일 형식만 업로드 가능'
  }
} as const;

// ===== 색상 상수 =====
export const COLORS = {
  STATUS: {
    SUCCESS: 'green',
    ERROR: 'red',
    WARNING: 'yellow',
    INFO: 'blue'
  },
  THEME: {
    PRIMARY: 'blue',
    SECONDARY: 'gray',
    DESTRUCTIVE: 'red'
  }
} as const;

// ===== 아이콘 상수 =====
export const ICONS = {
  FILE: {
    CSV: 'FileSpreadsheet',
    EXCEL: 'FileSpreadsheet',
    GENERIC: 'File'
  },
  STATUS: {
    SUCCESS: 'CheckCircle',
    ERROR: 'XCircle',
    WARNING: 'AlertTriangle',
    INFO: 'Info'
  },
  ACTIONS: {
    UPLOAD: 'Upload',
    DOWNLOAD: 'Download',
    DELETE: 'Trash2',
    EDIT: 'Edit',
    SAVE: 'Save',
    CANCEL: 'X',
    REFRESH: 'RefreshCw'
  }
} as const;

// ===== 환경 변수 =====
export const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test'
} as const;

// ===== 기능 플래그 =====
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'
} as const;
