'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle, Trash2, Plus, AlertCircle, Download } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'


interface ProcessedData {
  deletedItems: Array<{
    id: string
    title: string
    image_link: string
    add_image_link: string
    video_url: string
    [key: string]: unknown
  }>
  createdItems: Array<{
    id: string
    title: string
    image_link: string
    add_image_link: string
    video_url: string
    [key: string]: unknown
  }>
  unmatchedProducts: Array<{
    id: string
    title: string
  }>
  message: string
}

interface ClickDataProcessorProps {
  onFileSelect: (file: File) => void
}

export function ClickDataProcessor({ onFileSelect }: ClickDataProcessorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'save_deleted' | 'save_created' | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      onFileSelect(selectedFile)
      processFile(selectedFile)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: isProcessingFile
  })

  const processFile = async (file: File) => {
    setIsProcessingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/process-click-data', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('파일 처리 중 오류가 발생했습니다')
      }
      
      const result = await response.json()
      setProcessedData(result)
    } catch (error) {
      console.error('파일 처리 오류:', error)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleSaveDeletedData = () => {
    setConfirmAction('save_deleted')
    setShowConfirmDialog(true)
  }

  const handleSaveCreatedData = () => {
    setConfirmAction('save_created')
    setShowConfirmDialog(true)
  }

  const confirmActionHandler = async () => {
    if (!processedData || !confirmAction) return

    try {
      const endpoint = confirmAction === 'save_deleted' ? '/api/save-deleted-data' : '/api/save-created-data'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: confirmAction === 'save_deleted' ? processedData.deletedItems : processedData.createdItems
        }),
      })

      if (!response.ok) {
        throw new Error('데이터 처리 중 오류가 발생했습니다')
      }

      alert(`${confirmAction === 'save_deleted' ? '삭제된 데이터가 보관되었습니다' : '생성된 데이터가 저장되었습니다'}`)
      
      setShowConfirmDialog(false)
      setConfirmAction(null)
    } catch (error) {
      console.error('데이터 처리 오류:', error)
      alert('데이터 처리 중 오류가 발생했습니다')
    }
  }

  const handleExportAllData = async () => {
    try {
      const response = await fetch('/api/export-all-data', {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error('데이터 내보내기 중 오류가 발생했습니다')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '전체_데이터.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('데이터 내보내기 오류:', error)
      alert('데이터 내보내기 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="space-y-6">
      {/* 파일 업로드 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            클릭수 데이터 파일 업로드
          </CardTitle>
          <CardDescription>
            CSV 파일을 업로드하여 클릭수가 0인 상품을 처리합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? isDragAccept
                    ? 'border-green-400 bg-green-50 dark:bg-green-950'
                    : isDragReject
                    ? 'border-red-400 bg-red-50 dark:bg-red-950'
                    : 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              } ${isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              {isDragActive ? (
                isDragAccept ? (
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    CSV 파일을 여기에 놓으세요...
                  </p>
                ) : isDragReject ? (
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    CSV 파일만 업로드 가능합니다
                  </p>
                ) : (
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    파일을 여기에 놓으세요...
                  </p>
                )
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">
                    CSV 파일을 드래그하거나 클릭하여 업로드하세요
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    .csv, .xlsx, .xls 형식
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

            {file && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="secondary">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isProcessingFile && (
              <Alert>
                <AlertDescription>
                  파일을 처리 중입니다...
                </AlertDescription>
              </Alert>
            )}

            {/* 도움말 */}
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>• 지원 형식: CSV, Excel 파일 (.csv, .xlsx, .xls)</p>
              <p>• 파일 크기: 최대 10MB</p>
              <p>• 필수 컬럼: 상품ID, 상품명, 클릭수</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 처리 결과 섹션 */}
      {processedData && (
        <div className="space-y-4">
          {/* 처리 결과 메시지 */}
          {processedData.message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {processedData.message}
              </AlertDescription>
            </Alert>
          )}

          {/* 매칭되지 않은 상품들 */}
          {processedData.unmatchedProducts && processedData.unmatchedProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  매칭되지 않은 상품 ({processedData.unmatchedProducts.length}개)
                </CardTitle>
                <CardDescription>
                  클릭수가 0이지만 EP 데이터 테이블에서 해당 상품명을 찾을 수 없습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>상품ID</TableHead>
                        <TableHead>상품명</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.unmatchedProducts.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{product.id}</TableCell>
                          <TableCell>{product.title}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 삭제된 데이터 */}
          {processedData.deletedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  삭제된 데이터 ({processedData.deletedItems.length}개)
                </CardTitle>
                <CardDescription>
                  클릭수가 0인 상품들입니다. 삭제 테이블에 보관할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead>이미지 링크</TableHead>
                          <TableHead>추가 이미지 링크</TableHead>
                          <TableHead>비디오 URL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.deletedItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.image_link}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.add_image_link}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.video_url}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveDeletedData} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제 테이블에 보관
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 생성된 데이터 */}
          {processedData.createdItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  생성된 데이터 ({processedData.createdItems.length}개)
                </CardTitle>
                <CardDescription>
                  새로 생성된 상품들입니다. EP 데이터 테이블에 저장할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead>이미지 링크</TableHead>
                          <TableHead>추가 이미지 링크</TableHead>
                          <TableHead>비디오 URL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.createdItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.image_link}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.add_image_link}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.video_url}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveCreatedData}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      EP 데이터 테이블에 저장
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 전체 데이터 내보내기 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                전체 데이터 내보내기
              </CardTitle>
              <CardDescription>
                모든 데이터를 엑셀 파일로 내보낼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExportAllData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                전체 데이터 엑셀 다운로드
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'save_deleted' ? '삭제된 데이터 보관' : '생성된 데이터 저장'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'save_deleted' 
                ? '삭제된 데이터를 보관소에 이동하시겠습니까?'
                : '생성된 데이터를 EP 데이터 테이블에 저장하시겠습니까?'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={confirmActionHandler}
              variant={confirmAction === 'save_deleted' ? 'destructive' : 'default'}
            >
              {confirmAction === 'save_deleted' ? '보관' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
