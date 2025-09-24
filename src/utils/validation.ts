import { VALIDATION_RULES } from '@/types';

/**
 * 유효성 검사 유틸리티 함수들
 * 재사용 가능한 검증 로직 제공
 */

export const validators = {
  required: (value: any, message = '필수 입력 항목입니다'): string | null => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  },

  minLength: (value: string, min: number, message?: string): string | null => {
    if (value.length < min) {
      return message || `최소 ${min}자 이상 입력해주세요`;
    }
    return null;
  },

  maxLength: (value: string, max: number, message?: string): string | null => {
    if (value.length > max) {
      return message || `최대 ${max}자까지 입력 가능합니다`;
    }
    return null;
  },

  min: (value: number, min: number, message?: string): string | null => {
    if (value < min) {
      return message || `최소값은 ${min}입니다`;
    }
    return null;
  },

  max: (value: number, max: number, message?: string): string | null => {
    if (value > max) {
      return message || `최대값은 ${max}입니다`;
    }
    return null;
  },

  email: (value: string, message = '올바른 이메일 형식이 아닙니다'): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  url: (value: string, message = '올바른 URL 형식이 아닙니다'): string | null => {
    try {
      if (value && !new URL(value).href) {
        return message;
      }
    } catch {
      return message;
    }
    return null;
  },

  pattern: (value: string, pattern: RegExp, message = '형식이 올바르지 않습니다'): string | null => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return null;
  },

  fileSize: (file: File, maxSizeMB: number, message?: string): string | null => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return message || `파일 크기는 ${maxSizeMB}MB 이하여야 합니다`;
    }
    return null;
  },

  fileType: (file: File, allowedTypes: string[], message?: string): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return message || `허용된 파일 형식: ${allowedTypes.join(', ')}`;
    }
    return null;
  }
};

/**
 * EP 데이터 관련 검증 함수들
 */
export const epDataValidators = {
  validateItemCount: (count: number): string | null => {
    if (count < VALIDATION_RULES.MIN_ITEMS) {
      return `이미지링크를 최소 ${VALIDATION_RULES.MIN_ITEMS}개 이상 입력해주세요`;
    }
    if (count > VALIDATION_RULES.MAX_ITEMS) {
      return `이미지링크는 최대 ${VALIDATION_RULES.MAX_ITEMS}개까지 입력할 수 있습니다`;
    }
    return null;
  },

  validateAddItemCount: (count: number, excludeDuplicates: boolean): string | null => {
    if (excludeDuplicates && count < VALIDATION_RULES.MIN_ADD_ITEMS) {
      return `중복 제외 옵션 사용 시 add_image_link가 최소 ${VALIDATION_RULES.MIN_ADD_ITEMS}개 이상이어야 합니다`;
    }
    if (count > VALIDATION_RULES.MAX_ADD_ITEMS) {
      return `add_image_link는 최대 ${VALIDATION_RULES.MAX_ADD_ITEMS}개까지 사용할 수 있습니다`;
    }
    return null;
  },

  validateRequiredFields: (items: Array<{ id: string; title: string }>): string[] => {
    const errors: string[] = [];
    
    items.forEach((item, index) => {
      if (!item.id?.trim()) {
        errors.push(`${index + 1}번째 항목의 ID가 비어있습니다`);
      }
      if (!item.title?.trim()) {
        errors.push(`${index + 1}번째 항목의 제목이 비어있습니다`);
      }
    });

    return errors;
  }
};

/**
 * 복합 검증 함수
 */
export const validateAll = (value: any, rules: Array<(value: any) => string | null>): string | null => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

/**
 * 조건부 검증 함수
 */
export const validateIf = (
  condition: boolean,
  validator: (value: any) => string | null
) => {
  return (value: any) => condition ? validator(value) : null;
};
