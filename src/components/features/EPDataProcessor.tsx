'use client'

import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useApi } from '@/hooks/useApi'
import { useFileProcessor } from '@/hooks/useFileProcessor'
import { 
  FileProcessorProps, 
  ExcelDataItem, 
  EPDataResponse,
  FILE_CONFIG,
  DROPZONE_MESSAGES,
  MESSAGES,
  UI_CONFIG,
  FileType
} from '@/types'
import { handleError } from '@/utils/errorHandler'

export function EPDataProcessor({ onFileSelect }: FileProcessorProps) {
  const [newItems, setNewItems] = useState<ExcelDataItem[]>([])
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // API 훅 사용
  const { execute: saveToDatabase, isLoading: isSaving } = useApi<EPDataResponse>({
    showSuccessToast: true,
    successMessage: MESSAGES.SUCCESS.DATA_SAVED
  })

  // 파일 처리 훅 사용
  const { state: fileState, processFile, reset: resetFile } = useFileProcessor<ExcelDataItem[]>({
    acceptedTypes: FILE_CONFIG.ALLOWED_EXCEL_TYPES as readonly FileType[],
    maxFileSize: FILE_CONFIG.MAX_SIZE_MB,
    onSuccess: (data) => {
      setNewItems(data as ExcelDataItem[])
    },
    onError: (error) => {
      handleError(error, { component: 'EPDataProcessor', action: 'processFile' })
    }
  })

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
      processFile(selectedFile)
    }
  }, [onFileSelect, processFile])

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleSaveToDatabase = async () => {
    if (newItems.length === 0) return

    try {
      const result = await saveToDatabase('/api/admin/ep-data', {
        method: 'POST',
        body: JSON.stringify({ items: newItems })
      })

      if (result) {
        // 성공 후 상태 초기화
        setNewItems([])
        resetFile()
      }
    } catch (error) {
      handleError(error, { component: 'EPDataProcessor', action: 'saveToDatabase' })
    } finally {
      setShowConfirmDialog(false)
    }
  }

  const handleReset = () => {
    setNewItems([])
    resetFile()
  }

  const getDropzoneClassName = () => {
    let className = "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors "
    if (isDragActive) {
      className += "border-blue-400 bg-blue-50"
    } else if (isDragAccept) {
      className += "border-green-400 bg-green-50"
    } else if (isDragReject) {
      className += "border-red-400 bg-red-50"
    } else {
      className += "border-gray-300 hover:border-gray-400"
    }
    return className
  }

  const renderDropzone = () => (
    <div {...getRootProps()} className={getDropzoneClassName()}>
      <input {...getInputProps()} />
      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      {isDragActive ? (
        <p className="text-lg">{DROPZONE_MESSAGES.EXCEL.DRAG_ACTIVE}</p>
      ) : (
        <div>
          <p className="text-lg mb-2">{DROPZONE_MESSAGES.EXCEL.DRAG_INACTIVE}</p>
          <p className="text-sm text-gray-500">{DROPZONE_MESSAGES.EXCEL.FILE_TYPE_HINT}</p>
        </div>
      )}
    </div>
  )

  const renderFileInfo = () => {
    if (!fileState.file) return null

    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <FileSpreadsheet className="h-8 w-8 text-blue-600" />
        <div className="flex-1">
          <p className="font-medium">{fileState.file.name}</p>
          <p className="text-sm text-gray-500">
            {(fileState.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        {fileState.isProcessing && (
          <Badge variant="secondary">{MESSAGES.INFO.PROCESSING}</Badge>
        )}
      </div>
    )
  }

  const renderProcessingResults = () => {
    if (newItems.length === 0) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-medium">새로운 아이템 발견</h3>
          <Badge variant="default">{newItems.length}개</Badge>
        </div>

        <div className="border rounded-lg max-h-96 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>제목</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newItems.slice(0, UI_CONFIG.MAX_PREVIEW_ROWS).map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{item.id}</TableCell>
                  <TableCell className="max-w-md truncate" title={item.title}>
                    {item.title}
                  </TableCell>
                </TableRow>
              ))}
              {newItems.length > UI_CONFIG.MAX_PREVIEW_ROWS && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-gray-500">
                    ... 및 {newItems.length - UI_CONFIG.MAX_PREVIEW_ROWS}개 더
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setShowConfirmDialog(true)}
            disabled={isSaving}
          >
            {isSaving ? MESSAGES.INFO.SAVING : '데이터베이스에 저장'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
        </div>
      </div>
    )
  }

  const renderErrorMessages = () => {
    if (fileRejections.length > 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {MESSAGES.ERROR.INVALID_FILE_TYPE}
          </AlertDescription>
        </Alert>
      )
    }

    if (fileState.error) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fileState.error}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            EP 데이터 처리
          </CardTitle>
          <CardDescription>
            EP 데이터 엑셀 파일을 업로드하여 새로운 ID와 제목을 데이터베이스에 추가합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {renderDropzone()}
            {renderErrorMessages()}
            {renderFileInfo()}
            {renderProcessingResults()}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>데이터베이스에 저장</DialogTitle>
            <DialogDescription>
              {newItems.length}개의 새로운 아이템을 데이터베이스에 저장하시겠습니까?
              <br />
              <span className="text-sm text-gray-500">
                기존에 있는 ID는 건너뛰고 새로운 ID만 추가됩니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              취소
            </Button>
            <Button onClick={handleSaveToDatabase} disabled={isSaving}>
              {isSaving ? MESSAGES.INFO.SAVING : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EPDataProcessor