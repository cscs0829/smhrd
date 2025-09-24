'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

import { useApi } from '@/hooks/useApi'
import { useForm } from '@/hooks/useForm'
import { 
  DuplicateCheckResponse,
  MESSAGES,
  VALIDATION_CONFIG
} from '@/types'
import { handleError } from '@/utils/errorHandler'
import { validators } from '@/utils/validation'

interface SearchFormData extends Record<string, unknown> {
  title: string
}

export function DuplicateSearch() {
  // API 훅 사용
  const { data: searchResult, isLoading, execute: searchDuplicates, reset: resetSearch } = useApi<DuplicateCheckResponse>({
    showSuccessToast: false, // 성공/실패에 따른 토스트는 별도
    showErrorToast: true
  })

  // 폼 훅 사용
  const {
    values,
    errors,
    isValid,
    setValue,
    handleSubmit,
    reset: resetForm
  } = useForm<SearchFormData>({
    initialValues: { title: '' },
    validate: (values) => ({
      title: validators.required(values.title) || 
             validators.minLength(values.title, VALIDATION_CONFIG.MIN_TITLE_LENGTH) ||
             validators.maxLength(values.title, VALIDATION_CONFIG.MAX_TITLE_LENGTH)
    }),
    onSubmit: async (values) => {
      try {
        const result = await searchDuplicates('/api/admin/check-duplicates', {
          method: 'POST',
          body: JSON.stringify({ title: values.title.trim() })
        })

        if (result) {
          // 검색 결과에 따른 토스트 메시지
          if (result.foundInEpData || result.foundInDelete) {
            // 토스트는 useApi에서 자동으로 표시됨
          } else {
            // 중복되지 않은 경우 성공 메시지 표시
            console.log('중복되지 않은 제목입니다')
          }
        }
      } catch (error) {
        handleError(error, { component: 'DuplicateSearch', action: 'searchDuplicates' })
      }
    }
  })

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleReset = () => {
    resetForm()
    resetSearch()
  }

  const getStatusBadge = (found: boolean) => {
    return found ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        중복
      </Badge>
    ) : (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        없음
      </Badge>
    )
  }

  const renderSearchForm = () => (
    <div className="space-y-2">
      <Label htmlFor="search-title">검색할 제목</Label>
      <div className="flex gap-2">
        <Input
          id="search-title"
          placeholder="중복을 확인할 제목을 입력하세요"
          value={values.title}
          onChange={(e) => setValue('title', e.target.value)}
          onKeyPress={handleKeyPress}
          className={errors.title ? 'border-red-500' : ''}
        />
        <Button 
          onClick={handleSubmit}
          disabled={isLoading || !isValid || !values.title.trim()}
        >
          {isLoading ? MESSAGES.INFO.SEARCHING : '검색'}
        </Button>
      </div>
      {errors.title && (
        <p className="text-sm text-red-500">{errors.title}</p>
      )}
    </div>
  )

  const renderSearchResults = () => {
    if (!searchResult) return null

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">검색 결과</h3>
          <Badge variant="outline">{searchResult.title}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* EP 데이터 테이블 결과 */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                EP 데이터 테이블
                {getStatusBadge(searchResult.foundInEpData)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResult.foundInEpData ? (
                <div className="space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      중복된 제목이 발견되었습니다.
                    </AlertDescription>
                  </Alert>
                  {searchResult.epDataId && (
                    <div className="text-sm">
                      <strong>ID:</strong> 
                      <span className="font-mono ml-2">{searchResult.epDataId}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  중복된 제목이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 삭제 테이블 결과 */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                삭제 테이블
                {getStatusBadge(searchResult.foundInDelete)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchResult.foundInDelete ? (
                <div className="space-y-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      삭제된 제목이 발견되었습니다.
                    </AlertDescription>
                  </Alert>
                  {searchResult.deleteId && (
                    <div className="text-sm">
                      <strong>ID:</strong> 
                      <span className="font-mono ml-2">{searchResult.deleteId}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  삭제된 제목이 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 전체 상태 요약 */}
        <Card className={
          searchResult.foundInEpData || searchResult.foundInDelete 
            ? "border-red-200 bg-red-50" 
            : "border-green-200 bg-green-50"
        }>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              {searchResult.foundInEpData || searchResult.foundInDelete ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">
                    중복된 제목입니다. 다른 제목을 사용하세요.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    중복되지 않은 제목입니다. 사용 가능합니다.
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            새로 검색
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            제목 중복 검색
          </CardTitle>
          <CardDescription>
            입력한 제목이 EP 데이터 테이블과 삭제 테이블에 중복되는지 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {renderSearchForm()}
            {renderSearchResults()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DuplicateSearch