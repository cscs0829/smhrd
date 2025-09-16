'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Play, Download, Loader2 } from 'lucide-react'

interface ProcessButtonProps {
  onProcess: () => void
  onDownload?: () => void
  isProcessing: boolean
  hasFile: boolean
  result?: {
    success: boolean
    message: string
    downloadUrl?: string
  } | null
}

export function ProcessButton({ 
  onProcess, 
  onDownload, 
  isProcessing, 
  hasFile, 
  result 
}: ProcessButtonProps) {
  return (
    <div className="space-y-4">
      {/* 처리 버튼 */}
      <Button
        onClick={onProcess}
        disabled={!hasFile || isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            처리 중...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            데이터 처리 시작
          </>
        )}
      </Button>

      {/* 처리 진행률 */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>처리 중...</span>
            <span>잠시만 기다려주세요</span>
          </div>
          <Progress value={undefined} className="w-full" />
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div className={`p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
            : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "성공" : "오류"}
              </Badge>
              <span className={`font-medium ${
                result.success 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.message}
              </span>
            </div>
          </div>

          {/* 다운로드 버튼 */}
          {result.success && result.downloadUrl && onDownload && (
            <Button
              onClick={onDownload}
              className="w-full mt-3"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              결과 엑셀 파일 다운로드
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
