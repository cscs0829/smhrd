'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface DuplicateItem {
  id: string
  title: string
  count: number
  items: Array<{
    id: string
    title: string
    source: 'ep_data' | 'delete'
    [key: string]: unknown
  }>
}

interface DuplicateCheckerProps {
  generatedTitles?: Array<{
    title: string
    category: string
    keywords: string[]
  }>
  onRegenerateTitles?: (excludeTitles?: string[]) => Promise<void>
}

export function DuplicateChecker({ generatedTitles, onRegenerateTitles }: DuplicateCheckerProps = {}) {
  const [duplicates, setDuplicates] = useState<DuplicateItem[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearchDuplicates = async () => {
    console.log('중복 검색 시작:', { 
      generatedTitles: generatedTitles?.length, 
      titles: generatedTitles?.slice(0, 2) 
    })
    
    if (!generatedTitles || generatedTitles.length === 0) {
      console.log('generatedTitles가 없거나 비어있음')
      return
    }

    setIsSearching(true)
    try {
      console.log('API 요청 전송 중...')
      const response = await fetch('/api/duplicate-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titles: generatedTitles
        })
      })

      console.log('API 응답:', { status: response.status, ok: response.ok })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 오류 응답:', errorText)
        throw new Error('중복 검색 중 오류가 발생했습니다')
      }

      const result = await response.json()
      console.log('API 응답 데이터:', result)
      setDuplicates(result.duplicates || [])
    } catch (error) {
      console.error('중복 검색 오류:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRegenerateDuplicates = async () => {
    if (!onRegenerateTitles || duplicates.length === 0) {
      return
    }

    const duplicateTitles = duplicates.map(dup => dup.title)
    await onRegenerateTitles(duplicateTitles)
    setDuplicates([]) // 중복 목록 초기화
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          중복 데이터 검색
        </CardTitle>
        <CardDescription>
          ep_data 테이블에서 중복된 제목을 가진 항목들을 검색합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleSearchDuplicates} 
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? '검색 중...' : '중복 검색 시작'}
          </Button>

          {duplicates.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {duplicates.length}개의 중복 그룹을 발견했습니다
                </AlertDescription>
              </Alert>

              {onRegenerateTitles && (
                <Button 
                  onClick={handleRegenerateDuplicates}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  중복 제목들 새로 생성하기
                </Button>
              )}

              <div className="space-y-3">
                {duplicates.map((duplicate, index) => (
                  <Card key={index} className="border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{duplicate.title}</CardTitle>
                        <Badge variant="destructive">
                          {duplicate.count}개 중복
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {duplicate.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <CheckCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono">{item.id}</span>
                            <span className="text-sm text-gray-600">{item.title}</span>
                            <Badge variant="outline" className="ml-auto">
                              {item.source === 'ep_data' ? 'EP 데이터' : '삭제 테이블'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {duplicates.length === 0 && !isSearching && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                중복 검색을 실행하여 중복된 데이터를 찾아보세요
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
