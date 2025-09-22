'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle, Trash2, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface EPDataItem {
  id: string
  title: string
  deleted_at?: string
  [key: string]: unknown
}

interface ComparisonResult {
  newItems: EPDataItem[]
  removedItems: EPDataItem[]
  existingItems: EPDataItem[]
  deletedItems?: EPDataItem[] // deleted_items 테이블의 데이터
}

interface EPDataProcessorProps {
  onFileSelect: (file: File) => void
  isProcessing: boolean
}

export function EPDataProcessor({ onFileSelect }: EPDataProcessorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'save' | 'delete' | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      onFileSelect(selectedFile)
      processFile(selectedFile)
    }
  }

  const processFile = async (file: File) => {
    setIsProcessingFile(true)
    try {
      // Excel 파일을 읽고 데이터를 파싱하는 로직
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/process-ep-data', {
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
    setConfirmAction('save')
    setShowConfirmDialog(true)
  }

  const handleDeleteRemovedData = () => {
    setConfirmAction('delete')
    setShowConfirmDialog(true)
  }

  const confirmActionHandler = async () => {
    if (!comparisonResult || !confirmAction) return

    try {
      const endpoint = confirmAction === 'save' ? '/api/save-new-ep-data' : '/api/delete-removed-ep-data'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: confirmAction === 'save' ? comparisonResult.newItems : comparisonResult.removedItems
        }),
      })

      if (!response.ok) {
        throw new Error('데이터 처리 중 오류가 발생했습니다')
      }

      // 성공 메시지 표시
      alert(`${confirmAction === 'save' ? '새로운 데이터가 저장되었습니다' : '삭제된 데이터가 보관되었습니다'}`)
      
      setShowConfirmDialog(false)
      setConfirmAction(null)
    } catch (error) {
      console.error('데이터 처리 오류:', error)
      alert('데이터 처리 중 오류가 발생했습니다')
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
            ep데이터.xlsx 파일을 업로드하여 기존 데이터와 비교합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">ep데이터.xlsx 파일을 업로드하세요</p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={isProcessingFile}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>
            
            {file && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  파일이 선택되었습니다: <strong>{file.name}</strong>
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comparisonResult.newItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">{item.title}</p>
                        <p className="text-sm text-green-600">ID: {item.id}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        새 항목
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={handleSaveNewData} className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    새로운 데이터를 데이터베이스에 저장
                  </Button>
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
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comparisonResult.removedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">{item.title}</p>
                        <p className="text-sm text-red-600">ID: {item.id}</p>
                      </div>
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        삭제됨
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button onClick={handleDeleteRemovedData} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제된 데이터를 보관소에 이동
                  </Button>
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
                  변경사항이 없는 기존 항목들입니다 (활성 데이터 + 삭제된 데이터 포함)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comparisonResult.existingItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-blue-800">{item.title}</p>
                        <p className="text-sm text-blue-600">ID: {item.id}</p>
                        {item.deleted_at && (
                          <p className="text-xs text-orange-600">삭제된 데이터 (삭제됨: {new Date(item.deleted_at as string).toLocaleDateString()})</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        {item.deleted_at ? '삭제됨' : '기존'}
                      </Badge>
                    </div>
                  ))}
                  {comparisonResult.existingItems.length > 10 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      ... 및 {comparisonResult.existingItems.length - 10}개 더
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 삭제된 데이터 정보 */}
          {comparisonResult.deletedItems && comparisonResult.deletedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-orange-600" />
                  삭제된 데이터 ({comparisonResult.deletedItems.length}개)
                </CardTitle>
                <CardDescription>
                  이전에 삭제되어 deleted_items 테이블에 보관된 데이터들입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comparisonResult.deletedItems.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <p className="font-medium text-orange-800">{item.title}</p>
                        <p className="text-sm text-orange-600">ID: {item.id}</p>
                        <p className="text-xs text-orange-500">삭제됨: {new Date(item.deleted_at as string).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        삭제됨
                      </Badge>
                    </div>
                  ))}
                  {comparisonResult.deletedItems.length > 10 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      ... 및 {comparisonResult.deletedItems.length - 10}개 더
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
              {confirmAction === 'save' ? '새로운 데이터 저장' : '삭제된 데이터 보관'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'save' 
                ? '새로운 데이터를 데이터베이스에 저장하시겠습니까?'
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
              variant={confirmAction === 'delete' ? 'destructive' : 'default'}
            >
              {confirmAction === 'save' ? '저장' : '보관'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
