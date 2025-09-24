'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Database,
  X,
  Eye,
  Play
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { motion, AnimatePresence } from 'framer-motion'
import { ClickDataResponse } from '@/types'

interface ClickDataProcessorProps {
  onFileSelect?: () => void
}

interface PreviewData {
  zeroClickItems: Array<{id: string, title: string, clicks: number}>
  newItems: Array<{id: string, title: string, clicks: number}>
  existingItems: Array<{id: string, title: string, clicks: number}>
  totalCount: number
}

export default function ClickDataProcessor({}: ClickDataProcessorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [processingResult, setProcessingResult] = useState<ClickDataResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zeroVisibleCount, setZeroVisibleCount] = useState(10)
  const [newVisibleCount, setNewVisibleCount] = useState(10)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
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
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  })

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    setProcessingResult(null)
    setPreviewData(null)
  }

  const handlePreview = async () => {
    if (!file) return

    setIsPreviewing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/click-data/preview', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('미리보기 생성 중 오류가 발생했습니다.')
      }

      const data = await response.json()
      setPreviewData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : '미리보기 생성 중 오류가 발생했습니다.')
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleProcessData = async () => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/click-data', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('데이터 처리 중 오류가 발생했습니다.')
      }

      const result = await response.json()
      setProcessingResult(result)
      setPreviewData(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : '데이터 처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }


  const renderProcessingResult = () => {
    if (!processingResult) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium">처리 완료</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="bg-blue-50 p-4 rounded-lg"
          >
            <div className="text-2xl font-bold text-blue-600">{processingResult.totalCsvItems}</div>
            <div className="text-sm text-blue-700">CSV 총 개수</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="bg-orange-50 p-4 rounded-lg"
          >
            <div className="text-2xl font-bold text-orange-600">{processingResult.zeroClickItems}</div>
            <div className="text-sm text-orange-700">클릭수 0개</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
            className="bg-green-50 p-4 rounded-lg"
          >
            <div className="text-2xl font-bold text-green-600">{processingResult.movedToDelect}</div>
            <div className="text-sm text-green-700">ep_data에서 이동</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.2 }}
            className="bg-red-50 p-4 rounded-lg"
          >
            <div className="text-2xl font-bold text-red-600">{processingResult.notFoundInEpData}</div>
            <div className="text-sm text-red-700">ep_data에 없음</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-gray-50 p-4 rounded-lg"
        >
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
        </motion.div>
      </motion.div>
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
        {/* 드래그 앤 드롭 영역 */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="space-y-4"
          >
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'CSV 파일을 여기에 놓으세요' : 'CSV 파일을 드래그하거나 클릭하여 선택하세요'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                상품ID, 상품명, 클릭수 컬럼이 포함된 CSV 파일을 업로드하세요.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              CSV 파일만 지원
            </Badge>
          </motion.div>
        </div>

        {/* 선택된 파일 표시 */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isProcessing}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* 파일이 선택되었을 때의 버튼들 */}
        {file && !processingResult && (
          <div className="flex gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button 
                onClick={handlePreview}
                disabled={isPreviewing}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isPreviewing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    미리보기 생성 중...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    미리보기 보기
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        )}

        {/* 처리 결과가 있을 때의 버튼 */}
        {processingResult && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={() => {
                setProcessingResult(null)
                setFile(null)
              }}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              새 파일 선택
            </Button>
          </motion.div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>클릭수 데이터 처리 중...</span>
              <span>잠시만 기다려주세요</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        <AnimatePresence>
          {processingResult && renderProcessingResult()}
        </AnimatePresence>

        {/* 미리보기 다이얼로그 */}
        <Dialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
          <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>데이터 미리보기</DialogTitle>
              <DialogDescription>
                파일에서 읽은 데이터를 확인하고 데이터베이스에 적용할지 결정하세요.
              </DialogDescription>
            </DialogHeader>
            
            {previewData && (
          <div className="space-y-6">
                {/* 통계 요약 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">전체 데이터</p>
                          <p className="text-2xl font-bold text-blue-600">{previewData.totalCount}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">0클릭 상품</p>
                          <p className="text-2xl font-bold text-red-600">{previewData.zeroClickItems.length}</p>
                        </div>
          </div>
        </CardContent>
      </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">새로 추가될 데이터</p>
                          <p className="text-2xl font-bold text-green-600">{previewData.newItems.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 0클릭 상품 테이블 */}
                {previewData.zeroClickItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-700">0클릭 상품 ({previewData.zeroClickItems.length}개)</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>클릭수</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.zeroClickItems.slice(0, zeroVisibleCount).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm break-all">{item.id}</TableCell>
                              <TableCell className="whitespace-normal break-words">{item.title}</TableCell>
                              <TableCell className="text-red-600 font-bold">{item.clicks}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {previewData.zeroClickItems.length > zeroVisibleCount && (
                        <div className="p-3 text-sm text-center">
                          <Button variant="outline" size="sm" onClick={() => setZeroVisibleCount(c => c + 10)}>더보기 (+10)</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 새로 추가될 데이터 테이블 */}
                {previewData.newItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-green-700">새로 추가될 데이터 ({previewData.newItems.length}개)</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>클릭수</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.newItems.slice(0, newVisibleCount).map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-sm break-all">{item.id}</TableCell>
                              <TableCell className="whitespace-normal break-words">{item.title}</TableCell>
                              <TableCell>{item.clicks}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {previewData.newItems.length > newVisibleCount && (
                        <div className="p-3 text-sm text-center">
                          <Button variant="outline" size="sm" onClick={() => setNewVisibleCount(c => c + 10)}>더보기 (+10)</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setPreviewData(null)}>
              취소
            </Button>
            <Button 
                onClick={handleProcessData}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    데이터베이스에 적용
                  </>
                )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </CardContent>
      </Card>
  )
}