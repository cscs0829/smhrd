'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isProcessing?: boolean
}

export function FileUpload({ onFileSelect, isProcessing = false }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'text/csv') {
      setUploadedFile(file)
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isProcessing
  })

  const removeFile = () => {
    setUploadedFile(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          파일 업로드
        </CardTitle>
        <CardDescription>
          상품별 CSV 파일을 업로드하여 클릭수가 0인 상품을 처리합니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 파일 업로드 영역 */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              파일을 여기에 놓으세요...
            </p>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">
                CSV 파일을 드래그하거나 클릭하여 업로드하세요
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                상품별_YYYYMMDD_YYYYMMDD.csv 형식
              </p>
            </div>
          )}
        </div>

        {/* 파일 거부 오류 */}
        {fileRejections.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              CSV 파일만 업로드 가능합니다. 다른 형식의 파일은 지원되지 않습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 업로드된 파일 표시 */}
        {uploadedFile && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="font-medium">{uploadedFile.name}</span>
                <Badge variant="secondary">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700"
                >
                  제거
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 도움말 */}
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>• 지원 형식: CSV 파일 (.csv)</p>
          <p>• 파일 크기: 최대 10MB</p>
          <p>• 필수 컬럼: 상품ID, 상품명, 클릭수</p>
        </div>
      </CardContent>
    </Card>
  )
}
