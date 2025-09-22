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

interface EPDataItem {
  id: string
  title: string
  [key: string]: any
}

interface ComparisonResult {
  newItems: EPDataItem[]
  removedItems: EPDataItem[]
  existingItems: EPDataItem[]
}

interface EPDataProcessorNewProps {
  onFileSelect: (file: File) => void
  isProcessing: boolean
}

export function EPDataProcessorNew({ onFileSelect }: EPDataProcessorNewProps) {
  const [file, setFile] = useState<File | null>(null)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'save_new' | 'delete_removed' | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      onFileSelect(selectedFile)
      processFile(selectedFile)
    }
  }

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
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isProcessingFile
  })

  const processFile = async (file: File) => {
    setIsProcessingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/process-ep-data-new', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('파일 처리 중 오류가 발생했습니다')
      }
      
      const result = await response.json()
      setComparisonResult(result)
    } catch (error) {
      console.error('파일 처리 오류:', error)
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleSaveNewData = () => {
    setConfirmAction('save_new')
    setShowConfirmDialog(true)
  }

  const handleDeleteRemovedData = () => {
    setConfirmAction('delete_removed')
    setShowConfirmDialog(true)
  }

  const confirmActionHandler = async () => {
    if (!comparisonResult || !confirmAction) return

    try {
      const endpoint = confirmAction === 'save_new' ? '/api/save-new-ep-data' : '/api/delete-removed-ep-data'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: confirmAction === 'save_new' ? comparisonResult.newItems : comparisonResult.removedItems
        }),
      })

      if (!response.ok) {
        throw new Error('데이터 처리 중 오류가 발생했습니다')
      }

      alert(`${confirmAction === 'save_new' ? '새로운 데이터가 저장되었습니다' : '삭제된 데이터가 보관되었습니다'}`)
      
      setShowConfirmDialog(false)
      setConfirmAction(null)
    } catch (error) {
      console.error('데이터 처리 오류:', error)
      alert('데이터 처리 중 오류가 발생했습니다')
    }
  }

  const handleExportNewData = async () => {
    if (!comparisonResult?.newItems.length) return
    
    try {
      const response = await fetch('/api/export-new-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: comparisonResult.newItems }),
      })
      
      if (!response.ok) {
        throw new Error('데이터 내보내기 중 오류가 발생했습니다')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '새로운_데이터.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('데이터 내보내기 오류:', error)
      alert('데이터 내보내기 중 오류가 발생했습니다')
    }
  }

  const handleExportRemovedData = async () => {
    if (!comparisonResult?.removedItems.length) return
    
    try {
      const response = await fetch('/api/export-removed-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: comparisonResult.removedItems }),
      })
      
      if (!response.ok) {
        throw new Error('데이터 내보내기 중 오류가 발생했습니다')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '삭제된_데이터.xlsx'
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
            EP데이터 파일 업로드
          </CardTitle>
          <CardDescription>
            엑셀 파일을 업로드하여 기존 데이터와 비교합니다
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
                    Excel 파일을 여기에 놓으세요...
                  </p>
                ) : isDragReject ? (
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Excel 파일만 업로드 가능합니다
                  </p>
                ) : (
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    파일을 여기에 놓으세요...
                  </p>
                )
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">
                    Excel 파일을 드래그하거나 클릭하여 업로드하세요
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    .xlsx 또는 .xls 형식
                  </p>
                </div>
              )}
            </div>
            
            {/* 파일 거부 오류 */}
            {fileRejections.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Excel 파일만 업로드 가능합니다. 다른 형식의 파일은 지원되지 않습니다.
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
              <p>• 지원 형식: Excel 파일 (.xlsx, .xls)</p>
              <p>• 파일 크기: 최대 10MB</p>
              <p>• 필수 컬럼: ID, 제목</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비교 결과 섹션 */}
      {comparisonResult && (
        <div className="space-y-4">
          {/* 새로운 데이터 */}
          {comparisonResult.newItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  새로운 데이터 ({comparisonResult.newItems.length}개)
                </CardTitle>
                <CardDescription>
                  기존 데이터베이스에 없는 새로운 항목들입니다
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
                          <TableHead>기타 정보</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonResult.newItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {Object.keys(item).filter(key => !['id', 'title'].includes(key)).slice(0, 3).join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveNewData}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      EP 데이터 테이블에 저장
                    </Button>
                    <Button onClick={handleExportNewData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      엑셀로 내보내기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 삭제된 데이터 */}
          {comparisonResult.removedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  삭제된 데이터 ({comparisonResult.removedItems.length}개)
                </CardTitle>
                <CardDescription>
                  기존 데이터베이스에서 제거된 항목들입니다
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
                          <TableHead>기타 정보</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparisonResult.removedItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.id}</TableCell>
                            <TableCell>{item.title}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {Object.keys(item).filter(key => !['id', 'title'].includes(key)).slice(0, 3).join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDeleteRemovedData} variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제 테이블에 보관
                    </Button>
                    <Button onClick={handleExportRemovedData} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      엑셀로 내보내기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 기존 데이터 */}
          {comparisonResult.existingItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  기존 데이터 ({comparisonResult.existingItems.length}개)
                </CardTitle>
                <CardDescription>
                  변경사항이 없는 기존 항목들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>기타 정보</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonResult.existingItems.slice(0, 10).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.title}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {Object.keys(item).filter(key => !['id', 'title'].includes(key)).slice(0, 3).join(', ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {comparisonResult.existingItems.length > 10 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      ... 및 {comparisonResult.existingItems.length - 10}개 더
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 확인 다이얼로그 */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'save_new' ? '새로운 데이터 저장' : '삭제된 데이터 보관'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'save_new' 
                ? '새로운 데이터를 EP 데이터 테이블에 저장하시겠습니까?'
                : '삭제된 데이터를 보관소에 이동하시겠습니까?'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              취소
            </Button>
            <Button 
              onClick={confirmActionHandler}
              variant={confirmAction === 'delete_removed' ? 'destructive' : 'default'}
            >
              {confirmAction === 'save_new' ? '저장' : '보관'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
