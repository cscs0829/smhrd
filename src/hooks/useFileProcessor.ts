import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FileUploadState, CSVDataItem, ExcelDataItem, FileType } from '@/types';

interface UseFileProcessorOptions {
  acceptedTypes: readonly FileType[];
  maxFileSize?: number; // MB
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * 파일 처리 로직을 담당하는 커스텀 훅
 * 파일 업로드, 검증, 파싱 기능 제공
 */
export function useFileProcessor<T = any>(options: UseFileProcessorOptions) {
  const {
    acceptedTypes,
    maxFileSize = 10,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<FileUploadState>({
    file: null,
    isProcessing: false,
    isUploading: false,
    error: null
  });

  const validateFile = useCallback((file: File): string | null => {
    // 파일 크기 검증
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      return `파일 크기가 ${maxFileSize}MB를 초과합니다.`;
    }

    // 파일 타입 검증
    if (!acceptedTypes.includes(file.type as FileType)) {
      return `지원되지 않는 파일 형식입니다. 허용된 형식: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  const processCSV = useCallback(async (file: File): Promise<CSVDataItem[]> => {
    const text = await file.text();
    
    // EUC-KR 인코딩 처리
    let decodedText = text;
    try {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      const decoder = new TextDecoder('euc-kr');
      decodedText = decoder.decode(bytes);
    } catch (e) {
      console.warn('EUC-KR 디코딩 실패, 원본 텍스트 사용:', e);
    }

    const lines = decodedText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV 파일에 데이터가 없습니다');
    }

    // 헤더 파싱
    const headers = lines[0].split(',');
    const productIdIndex = headers.findIndex(h => h.includes('상품ID') || h.includes('ID'));
    const productNameIndex = headers.findIndex(h => h.includes('상품명') || h.includes('제목'));
    const clicksIndex = headers.findIndex(h => h.includes('클릭수') || h.includes('클릭'));

    if (productIdIndex === -1 || productNameIndex === -1 || clicksIndex === -1) {
      throw new Error('필요한 컬럼(상품ID, 상품명, 클릭수)을 찾을 수 없습니다');
    }

    // 데이터 파싱
    const items: CSVDataItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',');
      
      if (columns.length > Math.max(productIdIndex, productNameIndex, clicksIndex)) {
        const productId = columns[productIdIndex]?.trim().replace(/"/g, '');
        const productName = columns[productNameIndex]?.trim().replace(/"/g, '');
        const clicks = parseInt(columns[clicksIndex]?.trim().replace(/"/g, '') || '0');
        
        if (productId && productName) {
          items.push({
            productId,
            productName,
            clicks
          });
        }
      }
    }

    return items;
  }, []);

  const processExcel = useCallback(async (file: File): Promise<ExcelDataItem[]> => {
    const XLSX = await import('xlsx');
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length < 2) {
      throw new Error('엑셀 파일에 데이터가 없습니다');
    }

    // 헤더에서 컬럼 인덱스 찾기
    const headers = jsonData[0] as string[];
    const dataRows = jsonData.slice(1) as any[][];

    const idIndex = headers.findIndex(h => h && h.toLowerCase().includes('id'));
    const titleIndex = headers.findIndex(h => 
      h && (h.toLowerCase().includes('title') || h.toLowerCase().includes('제목'))
    );

    if (idIndex === -1 || titleIndex === -1) {
      throw new Error('ID 또는 제목 컬럼을 찾을 수 없습니다');
    }

    // 데이터 추출
    const items: ExcelDataItem[] = [];
    for (const row of dataRows) {
      const id = row[idIndex];
      const title = row[titleIndex];
      
      if (id && title) {
        items.push({
          id: String(id).trim(),
          title: String(title).trim()
        });
      }
    }

    // 중복 제거
    const uniqueItems = items.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    return uniqueItems;
  }, []);

  const processFile = useCallback(async (file: File): Promise<T | null> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // 파일 검증
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      let result: T;

      // 파일 타입에 따른 처리
      if (acceptedTypes.some(type => type.includes('csv'))) {
        result = await processCSV(file) as T;
      } else if (acceptedTypes.some(type => type.includes('sheet'))) {
        result = await processExcel(file) as T;
      } else {
        throw new Error('지원되지 않는 파일 형식입니다');
      }

      setState(prev => ({
        ...prev,
        file,
        isProcessing: false,
        error: null
      }));

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다';
      
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    }
  }, [acceptedTypes, validateFile, processCSV, processExcel, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      file: null,
      isProcessing: false,
      isUploading: false,
      error: null
    });
  }, []);

  return {
    state,
    processFile,
    reset,
    validateFile
  };
}
