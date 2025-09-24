import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ApiResponse, ApiEndpoint } from '@/types';

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (endpoint: ApiEndpoint, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

/**
 * API 호출을 위한 커스텀 훅
 * 공통 에러 처리, 로딩 상태 관리, 토스트 알림 포함
 */
export function useApi<T = any>(
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = '요청이 성공적으로 완료되었습니다'
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    endpoint: ApiEndpoint,
    requestOptions: RequestInit = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...requestOptions.headers,
        },
        ...requestOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || '요청 처리 중 오류가 발생했습니다');
      }

      setData(result.data || null);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      return result.data || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);

      if (showErrorToast) {
        toast.error(errorMessage);
      }

      console.error('API 호출 오류:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccessToast, showErrorToast, successMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}
