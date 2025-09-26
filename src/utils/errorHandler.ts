import { toast } from 'sonner';

/**
 * 에러 타입 정의
 */
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * 에러 처리 클래스
 */
export class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 에러를 처리하고 사용자에게 적절한 메시지를 표시
   */
  handleError(error: unknown, context?: ErrorContext): AppError {
    const appError = this.createAppError(error);
    
    // 콘솔에 에러 로깅
    this.logError(appError, context);
    
    // 사용자에게 토스트 메시지 표시
    this.showUserMessage(appError);
    
    return appError;
  }

  /**
   * 에러를 AppError 형태로 변환
   */
  private createAppError(error: unknown): AppError {
    if (error instanceof Error) {
      return {
        code: this.getErrorCode(error),
        message: this.getErrorMessage(error),
        details: error.stack,
        timestamp: new Date().toISOString()
      };
    }

    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
        timestamp: new Date().toISOString()
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: '알 수 없는 오류가 발생했습니다',
      details: error,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 에러 코드 추출
   */
  private getErrorCode(error: Error): string {
    // 네트워크 에러
    if (error.message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }

    // HTTP 에러
    if (error.message.includes('HTTP error')) {
      return 'HTTP_ERROR';
    }

    // 파일 처리 에러
    if (error.message.includes('파일') || error.message.includes('CSV') || error.message.includes('Excel')) {
      return 'FILE_PROCESSING_ERROR';
    }

    // 데이터베이스 에러
    if (error.message.includes('database') || error.message.includes('Supabase')) {
      return 'DATABASE_ERROR';
    }

    // 유효성 검사 에러
    if (error.message.includes('validation') || error.message.includes('검증')) {
      return 'VALIDATION_ERROR';
    }

    return 'GENERAL_ERROR';
  }

  /**
   * 사용자 친화적 에러 메시지 생성
   */
  private getErrorMessage(error: Error): string {
    const code = this.getErrorCode(error);

    switch (code) {
      case 'NETWORK_ERROR':
        return '네트워크 연결을 확인해주세요';
      case 'HTTP_ERROR':
        return '서버 응답에 문제가 있습니다. 잠시 후 다시 시도해주세요';
      case 'FILE_PROCESSING_ERROR':
        return error.message; // 파일 관련 에러는 원본 메시지 유지
      case 'DATABASE_ERROR':
        return '데이터베이스 처리 중 오류가 발생했습니다';
      case 'VALIDATION_ERROR':
        return error.message; // 유효성 검사 에러는 원본 메시지 유지
      default:
        return error.message || '알 수 없는 오류가 발생했습니다';
    }
  }

  /**
   * 에러 로깅
   */
  private logError(error: AppError, context?: ErrorContext): void {
    const logData = {
      error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // 개발 환경에서는 콘솔에 상세 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Application Error:', logData);
    } else {
      // 프로덕션에서는 간단한 로깅
      console.error(`Error [${error.code}]:`, error.message);
    }

    // TODO: 실제 프로덕션에서는 외부 로깅 서비스로 전송
    // this.sendToLoggingService(logData);
  }

  /**
   * 사용자에게 토스트 메시지 표시
   */
  private showUserMessage(error: AppError): void {
    // 특정 에러 코드는 토스트를 표시하지 않음
    const silentErrors = ['VALIDATION_ERROR'];
    
    if (!silentErrors.includes(error.code)) {
      toast.error(error.message);
    }
  }

  /**
   * API 에러 처리
   */
  handleApiError(response: Response, context?: ErrorContext): AppError {
    const error = new Error(`HTTP error! status: ${response.status}`);
    return this.handleError(error, context);
  }

  /**
   * 파일 처리 에러 처리
   */
  handleFileError(error: Error, fileName?: string, context?: ErrorContext): AppError {
    const enhancedContext = {
      ...context,
      additionalData: {
        ...context?.additionalData,
        fileName
      }
    };
    
    return this.handleError(error, enhancedContext);
  }

  /**
   * 유효성 검사 에러 처리
   */
  handleValidationError(errors: string[], context?: ErrorContext): AppError {
    const error = new Error(errors.join(', '));
    return this.handleError(error, context);
  }
}

/**
 * 전역 에러 핸들러 인스턴스
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * 에러 처리 헬퍼 함수들
 */
export const handleError = (error: unknown, context?: ErrorContext) => 
  errorHandler.handleError(error, context);

export const handleApiError = (response: Response, context?: ErrorContext) => 
  errorHandler.handleApiError(response, context);

export const handleFileError = (error: Error, fileName?: string, context?: ErrorContext) => 
  errorHandler.handleFileError(error, fileName, context);

export const handleValidationError = (errors: string[], context?: ErrorContext) => 
  errorHandler.handleValidationError(errors, context);
