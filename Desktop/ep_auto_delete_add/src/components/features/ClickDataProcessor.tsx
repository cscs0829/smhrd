'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  Trash2,
  ArrowRight
} from 'lucide-react'
import { ClickDataResponse } from '@/types'

interface ClickDataProcessorProps {
  onFileSelect?: () => void
}

export default function ClickDataProcessor({ onFileSelect }: ClickDataProcessorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingResult, setProcessingResult] = useState<ClickDataResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError(null)
        setProcessingResult(null)
      } else {
        setError('CSV 파일만 업로드 가능합니다.')
        setFile(null)
      }
    }
  }

  const handleProcessClickData = async () => {
    if (!file) {
      setError('파일을 선택해주세요.')
      return
    }

    setIsProcessing(true)
    setError(null)
    setProcessingResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/click-data', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setProcessingResult(result)
      } else {
        setError(result.error || '클릭수 데이터 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('클릭수 데이터 처리 오류:', error)
      setError('클릭수 데이터 처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderProcessingResult = () => {
    if (!processingResult) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium">처리 완료</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{processingResult.totalCsvItems}</div>
            <div className="text-sm text-blue-700">CSV 총 개수</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{processingResult.zeroClickItems}</div>
            <div className="text-sm text-orange-700">클릭수 0개</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{processingResult.movedToDelect}</div>
            <div className="text-sm text-green-700">ep_data에서 이동</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{processingResult.notFoundInEpData}</div>
            <div className="text-sm text-red-700">ep_data에 없음</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">처리 결과</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• CSV 파일 총 {processingResult.totalCsvItems}개 상품 중 클릭수 0개: {processingResult.zeroClickItems}개</p>
            <p>• ep_data에 있던 데이터: {processingResult.movedToDelect}개 → delect 테이블로 이동</p>
            <p>• ep_data에 없던 데이터: {processingResult.notFoundInEpData}개 → delect 테이블에 추가</p>
            <p>• 총 {processingResult.totalMovedToDelect}개 데이터가 delect 테이블로 이동되었습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          클릭수 데이터 처리
        </CardTitle>
        <CardDescription>
          CSV 파일에서 클릭수가 0인 상품들을 찾아서 delect 테이블로 이동시킵니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="csv-file">CSV 파일 선택</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <p className="text-sm text-gray-500">
            상품ID, 상품명, 클릭수 컬럼이 포함된 CSV 파일을 업로드하세요.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{file.name}</span>
            <span className="text-sm text-gray-500">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleProcessClickData}
          disabled={!file || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              클릭수 데이터 처리
            </>
          )}
        </Button>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>클릭수 데이터 처리 중...</span>
              <span>잠시만 기다려주세요</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {processingResult && renderProcessingResult()}
      </CardContent>
    </Card>
  )
}
