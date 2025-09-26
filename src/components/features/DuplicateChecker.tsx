'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface DuplicateItem {
  title: string
  count: number
  exactMatches: number
  mostSimilar: {
    title: string
    similarity: number
    source: 'ep_data' | 'delect'
  }
  items: Array<{
    id: string
    title: string
    source: 'ep_data' | 'delect'
    similarity: number
    distance: number
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
  const [hasSearched, setHasSearched] = useState(false)

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
    setHasSearched(true)
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
    setHasSearched(false) // 검색 상태 초기화
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
                  {duplicates.length}개의 제목에서 유사한 항목을 발견했습니다
                </AlertDescription>
              </Alert>

                      {onRegenerateTitles && duplicates.length > 0 && (
                        <Button 
                          onClick={handleRegenerateDuplicates}
                          variant="outline"
                          className="w-full"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          중복 제목들 새로 생성하기
                        </Button>
                      )}

              <div className="space-y-4">
                {duplicates.map((duplicate, index) => (
                  <Card key={index} className="border-orange-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{duplicate.title}</CardTitle>
                        <div className="flex gap-2">
                          {duplicate.exactMatches > 0 && (
                            <Badge variant="destructive">
                              정확 일치 {duplicate.exactMatches}개
                            </Badge>
                          )}
                          <Badge variant="outline">
                            유사 {duplicate.count}개
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* 가장 유사한 제목 표시 */}
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-900 dark:text-blue-100">가장 유사한 제목</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">{duplicate.mostSimilar.title}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {duplicate.mostSimilar.source === 'ep_data' ? 'EP 데이터' : 'Delect 테이블'} • 
                              유사도 {duplicate.mostSimilar.similarity}%
                            </div>
                          </div>
                          <Badge 
                            variant={duplicate.mostSimilar.similarity >= 90 ? "destructive" : 
                                   duplicate.mostSimilar.similarity >= 70 ? "default" : "secondary"}
                            className="text-lg px-3 py-1"
                          >
                            {duplicate.mostSimilar.similarity}%
                          </Badge>
                        </div>
                      </div>

                      {/* 유사한 제목들 목록 */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">유사한 제목들 (상위 10개)</h4>
                        {duplicate.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <CheckCircle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm font-mono text-xs text-gray-600 dark:text-gray-400">{item.id}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300 flex-1">{item.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={item.similarity >= 90 ? "destructive" : 
                                       item.similarity >= 70 ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {item.similarity}%
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.source === 'ep_data' ? 'EP' : 'Delect'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!hasSearched && !isSearching && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                중복 검색을 실행하여 중복된 데이터를 찾아보세요
              </AlertDescription>
            </Alert>
          )}

          {hasSearched && duplicates.length === 0 && !isSearching && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 중복된 제목을 찾지 못했습니다! 생성된 제목들이 모두 고유합니다.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
