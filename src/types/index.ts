/**
 * 공통 타입 정의
 * 모든 컴포넌트와 API에서 사용되는 타입들을 중앙화
 */

// ===== 데이터베이스 관련 타입 =====

export interface EPDataItem {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface DeleteItem {
  id: number;
  product_id: string;
  title: string;
  reason: string;
  created_at: string;
}

export interface ApiKey {
  id: number;
  provider: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
  usage_count: number;
}

// ===== API 응답 타입 =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EPDataResponse {
  success: boolean;
  addedCount: number;
  totalItems: number;
  skippedCount: number;
}

export interface MoveToDeleteResponse {
  success: boolean;
  movedCount: number;
  totalItems: number;
  movedItems: Array<{
    productId: string;
    title: string;
  }>;
}

export interface DuplicateCheckResponse {
  title: string;
  foundInEpData: boolean;
  foundInDelete: boolean;
  epDataId?: string;
  deleteId?: string;
}

export interface DatabaseStatusResponse {
  connectionStatus: 'connected' | 'error';
  tableCounts: {
    ep_data: number;
    delete: number;
    api_keys: number;
  };
  recentData: {
    ep_data: EPDataItem[];
    delete: DeleteItem[];
    api_keys: ApiKey[];
  };
}

// ===== 파일 처리 관련 타입 =====

export interface FileUploadState {
  file: File | null;
  isProcessing: boolean;
  isUploading: boolean;
  error: string | null;
}

export interface CSVDataItem {
  productId: string;
  productName: string;
  clicks: number;
}

export interface ExcelDataItem {
  id: string;
  title: string;
}

// ===== UI 상태 타입 =====

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ===== 컴포넌트 Props 타입 =====

export interface FileProcessorProps {
  onFileSelect: (file: File) => void;
  onProcessComplete?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export interface TableDisplayProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// ===== 폼 관련 타입 =====

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// ===== 설정 관련 타입 =====

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  ui: {
    theme: 'light' | 'dark';
    language: string;
  };
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
  };
}

// ===== 유틸리티 타입 =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ===== 이벤트 타입 =====

export interface FileDropEvent {
  file: File;
  type: 'csv' | 'xlsx' | 'xls';
}

export interface ProcessCompleteEvent<T = unknown> {
  type: 'success' | 'error';
  data?: T;
  error?: Error;
  timestamp: string;
}

// ===== 상수 타입 =====

export const FILE_TYPES = {
  CSV: ['text/csv', 'application/vnd.ms-excel'],
  EXCEL: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
} as const;

export const API_ENDPOINTS = {
  EP_DATA: '/api/admin/ep-data',
  MOVE_TO_DELETE: '/api/admin/move-to-delete',
  CHECK_DUPLICATES: '/api/admin/check-duplicates',
  DB_STATUS: '/api/admin/db-status'
} as const;

export const VALIDATION_RULES = {
  MIN_ITEMS: 5,
  MAX_ITEMS: 11,
  MIN_ADD_ITEMS: 5,
  MAX_ADD_ITEMS: 10
} as const;

export type FileType = typeof FILE_TYPES.CSV[number] | typeof FILE_TYPES.EXCEL[number];
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

// ===== 추가 상수들 (기존 constants.ts에서 가져옴) =====
export const FILE_CONFIG = {
  MAX_SIZE_MB: 10,
  ALLOWED_CSV_TYPES: ['text/csv', 'application/vnd.ms-excel'] as const,
  ALLOWED_EXCEL_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ] as const,
} as const;

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
} as const;

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
    FILE_TOO_LARGE: '파일 크기는 10MB 이하여야 합니다',
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

export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TABLE_PAGE_SIZE: 10,
  MAX_PREVIEW_ROWS: 5
} as const;

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
