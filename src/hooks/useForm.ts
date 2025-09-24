import { useState, useCallback, useMemo } from 'react';
import { FormState, ValidationResult } from '@/types';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string | null | undefined>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

/**
 * 폼 상태 관리를 위한 커스텀 훅
 * 유효성 검사, 에러 처리, 제출 기능 포함
 */
export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialValues, validate, onSubmit } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false
  });

  const setValue = useCallback((name: keyof T, value: any) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const errors = validate ? validate(newValues) : {};
      
      return {
        ...prev,
        values: newValues,
        errors,
        touched: { ...prev.touched, [name]: true },
        isValid: Object.keys(errors).length === 0
      };
    });
  }, [validate]);

  const setError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false
    }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[name];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0
      };
    });
  }, []);

  const setTouched = useCallback((name: keyof T, touched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [name]: touched }
    }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!onSubmit) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // 전체 폼 유효성 검사
      const errors = validate ? validate(state.values) : {};
      
      if (Object.keys(errors).length > 0) {
        setState(prev => ({
          ...prev,
          errors,
          isValid: false,
          isSubmitting: false
        }));
        return;
      }

      await onSubmit(state.values);
      
      setState(prev => ({ ...prev, isSubmitting: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        errors: { ...prev.errors, submit: error instanceof Error ? error.message : '제출 중 오류가 발생했습니다' }
      }));
    }
  }, [onSubmit, validate, state.values]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false
    });
  }, [initialValues]);

  const validationResult = useMemo((): ValidationResult => {
    const errors = Object.values(state.errors).filter(Boolean) as string[];
    
    return {
      isValid: state.isValid && errors.length === 0,
      errors,
      warnings: []
    };
  }, [state.errors, state.isValid]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isSubmitting: state.isSubmitting,
    validationResult,
    setValue,
    setError,
    clearError,
    setTouched,
    handleSubmit,
    reset
  };
}
