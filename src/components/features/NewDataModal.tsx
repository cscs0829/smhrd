'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Sheet } from 'react-modal-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Plus, Save, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTheme } from 'next-themes'

interface NewDataModalProps {
  isOpen: boolean
  onClose: () => void
  tableName: string
  onSave: (data: Record<string, unknown>) => Promise<void>
  schema?: {
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }[]
}

export default function NewDataModal({
  isOpen,
  onClose,
  tableName,
  onSave,
  schema = []
}: NewDataModalProps) {
  const { resolvedTheme } = useTheme()
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // 폼 데이터 초기화
  useEffect(() => {
    if (isOpen && schema.length > 0) {
      const initialData: Record<string, unknown> = {}
      schema.forEach(column => {
        if (column.column_default !== null) {
          initialData[column.column_name] = column.column_default
        } else if (column.data_type === 'boolean') {
          initialData[column.column_name] = false
        } else if (column.data_type.includes('int') || column.data_type.includes('numeric')) {
          initialData[column.column_name] = 0
        } else {
          initialData[column.column_name] = ''
        }
      })
      setFormData(initialData)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, schema])

  // 폼 데이터 업데이트
  const handleInputChange = useCallback((columnName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }))
  }, [])

  // 폼 제출
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await onSave(formData)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [formData, onSave, onClose])

  // 입력 필드 렌더링
  const renderInputField = (column: { column_name: string; data_type: string; is_nullable: string }) => {
    const { column_name, data_type, is_nullable } = column
    const value = formData[column_name] || ''
    const isRequired = is_nullable === 'NO'

    if (data_type === 'boolean') {
      return (
        <div key={column_name} className="space-y-2">
          <Label htmlFor={column_name} className="text-sm font-medium">
            {column_name} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={value ? 'true' : 'false'}
            onValueChange={(val) => handleInputChange(column_name, val === 'true')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    if (data_type.includes('text') || data_type.includes('varchar')) {
      return (
        <div key={column_name} className="space-y-2">
          <Label htmlFor={column_name} className="text-sm font-medium">
            {column_name} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          {data_type.includes('text') ? (
            <Textarea
              id={column_name}
              value={String(value)}
              onChange={(e) => handleInputChange(column_name, e.target.value)}
              placeholder={`${column_name}을(를) 입력하세요`}
              className="min-h-[100px]"
            />
          ) : (
            <Input
              id={column_name}
              value={String(value)}
              onChange={(e) => handleInputChange(column_name, e.target.value)}
              placeholder={`${column_name}을(를) 입력하세요`}
            />
          )}
        </div>
      )
    }

    if (data_type.includes('int') || data_type.includes('numeric') || data_type.includes('decimal')) {
      return (
        <div key={column_name} className="space-y-2">
          <Label htmlFor={column_name} className="text-sm font-medium">
            {column_name} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={column_name}
            type="number"
            value={String(value)}
            onChange={(e) => handleInputChange(column_name, parseFloat(e.target.value) || 0)}
            placeholder={`${column_name}을(를) 입력하세요`}
          />
        </div>
      )
    }

    if (data_type.includes('date') || data_type.includes('timestamp')) {
      return (
        <div key={column_name} className="space-y-2">
          <Label htmlFor={column_name} className="text-sm font-medium">
            {column_name} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={column_name}
            type={data_type.includes('date') ? 'date' : 'datetime-local'}
            value={String(value)}
            onChange={(e) => handleInputChange(column_name, e.target.value)}
          />
        </div>
      )
    }

    // 기본 텍스트 입력
    return (
      <div key={column_name} className="space-y-2">
        <Label htmlFor={column_name} className="text-sm font-medium">
          {column_name} {isRequired && <span className="text-red-500">*</span>}
        </Label>
        <Input
          id={column_name}
          value={String(value)}
          onChange={(e) => handleInputChange(column_name, e.target.value)}
          placeholder={`${column_name}을(를) 입력하세요`}
        />
      </div>
    )
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose}>
      <Sheet.Container
        style={{
          backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      >
        <Sheet.Header>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                새 데이터 추가
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({tableName})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Sheet.Header>

        <Sheet.Content>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">데이터 입력</CardTitle>
                <CardDescription>
                  {tableName} 테이블에 새로운 데이터를 추가합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        데이터가 성공적으로 저장되었습니다!
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {schema.map(renderInputField)}
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          저장
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  )
}
