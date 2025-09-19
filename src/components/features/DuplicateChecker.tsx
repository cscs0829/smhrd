'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Filter
} from 'lucide-react'
import type { DuplicateCheckResult } from '@/lib/text-similarity'

interface DuplicateCheckStats {
  checkedTitles: number
  titlesWithDuplicates: number
  totalDuplicateMatches: number
  breakdown: {
    exact: number
    high: number
    medium: number
    low: number
  }
  threshold: number
  existingTitlesCount: number
}

interface DuplicateCheckResponse {
  results: {
    [title: string]: {
      duplicates: DuplicateCheckResult[]
      categories: {
        exact: DuplicateCheckResult[]
        high: DuplicateCheckResult[]
        medium: DuplicateCheckResult[]
        low: DuplicateCheckResult[]
      }
      summary: {
        total: number
        exact: number
        high: number
        medium: number
        low: number
      }
    }
  }
  stats: DuplicateCheckStats
  success: boolean
}

interface DuplicateCheckerProps {
  generatedTitles: Array<{ title: string; category: string; keywords: string[] }>
  onRegenerateTitles?: (excludeTitles: string[]) => void
}

export function DuplicateChecker({ generatedTitles, onRegenerateTitles }: DuplicateCheckerProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [checkResults, setCheckResults] = useState<DuplicateCheckResponse | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filteredTitles, setFilteredTitles] = useState<string[]>([])
  const [threshold, setThreshold] = useState(0.8)

  const checkDuplicates = useCallback(async () => {
    if (generatedTitles.length === 0) return

    setIsChecking(true)
    try {
      const titles = generatedTitles.map(item => item.title)
      
      const response = await fetch('/api/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titles,
          threshold
        }),
      })

      if (!response.ok) {
        throw new Error('중복 검사에 실패했습니다.')
      }

      const data = await response.json()
      setCheckResults(data)
      
      // 중복이 있는 제목들을 필터링
      const titlesWithDuplicates = Object.keys(data.results)
      setFilteredTitles(titlesWithDuplicates)
      
    } catch (error) {
      console.error('중복 검사 오류:', error)
      alert('중복 검사 중 오류가 발생했습니다.')
    } finally {
      setIsChecking(false)
    }
  }, [generatedTitles, threshold])

  const handleRegenerate = useCallback(() => {
    if (onRegenerateTitles && filteredTitles.length > 0) {
      onRegenerateTitles(filteredTitles)
      setCheckResults(null)
      setFilteredTitles([])
    }
  }, [onRegenerateTitles, filteredTitles])

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.95) return 'text-red-600 bg-red-50'
    if (similarity >= 0.85) return 'text-orange-600 bg-orange-50'
    if (similarity >= 0.70) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getSimilarityIcon = (similarity: number) => {
    if (similarity >= 0.95) return <XCircle className="h-4 w-4" />
    if (similarity >= 0.85) return <AlertTriangle className="h-4 w-4" />
    if (similarity >= 0.70) return <Info className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.95) return '완전 중복'
    if (similarity >= 0.85) return '높은 유사도'
    if (similarity >= 0.70) return '중간 유사도'
    return '낮은 유사도'
  }

  const exportResults = useCallback(() => {
    if (!checkResults) return

    const csvContent = [
      '제목,유사도,매칭된 제목,매칭 타입,매칭 날짜',
      ...Object.entries(checkResults.results).flatMap(([title, result]) =>
        result.duplicates.map(dup => 
          `"${title}","${(dup.similarity * 100).toFixed(1)}%","${dup.matchedTitle}","${dup.matchType}","${dup.matchDate}"`
        )
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `중복검사결과_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [checkResults])

  if (generatedTitles.length === 0) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          중복 검사
        </CardTitle>
        <CardDescription>
          생성된 제목들이 기존 EP 데이터와 중복되는지 확인합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검사 설정 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="threshold" className="text-sm font-medium">
              유사도 임계값:
            </label>
            <select
              id="threshold"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
              disabled={isChecking}
            >
              <option value={0.9}>90% (매우 엄격)</option>
              <option value={0.8}>80% (엄격)</option>
              <option value={0.7}>70% (보통)</option>
              <option value={0.6}>60% (관대)</option>
            </select>
          </div>
          
          <Button
            onClick={checkDuplicates}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isChecking ? '검사 중...' : '중복 검사 실행'}
          </Button>
        </div>

        {/* 검사 결과 */}
        {checkResults && (
          <div className="space-y-4">
            {/* 전체 통계 */}
            <Alert>
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>검사 완료:</strong> {checkResults.stats.checkedTitles}개 제목 중{' '}
                    {checkResults.stats.titlesWithDuplicates}개에서 중복 발견
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResults}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" />
                    CSV 내보내기
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {/* 유사도 분포 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">유사도 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {checkResults.stats.breakdown.exact}
                    </div>
                    <div className="text-sm text-muted-foreground">완전 중복 (95%+)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {checkResults.stats.breakdown.high}
                    </div>
                    <div className="text-sm text-muted-foreground">높은 유사도 (85-95%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {checkResults.stats.breakdown.medium}
                    </div>
                    <div className="text-sm text-muted-foreground">중간 유사도 (70-85%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {checkResults.stats.breakdown.low}
                    </div>
                    <div className="text-sm text-muted-foreground">낮은 유사도 (70% 미만)</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 결과 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">중복 검사 결과</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1"
                >
                  {showDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showDetails ? '간단히 보기' : '상세히 보기'}
                </Button>
              </div>

              {Object.entries(checkResults.results).map(([title, result]) => (
                <Card key={title} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{title}</CardTitle>
                      <Badge variant="destructive">
                        {result.summary.total}개 중복
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showDetails ? (
                      <div className="space-y-2">
                        {result.duplicates.map((duplicate, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${getSimilarityColor(duplicate.similarity)}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getSimilarityIcon(duplicate.similarity)}
                                <span className="font-medium">
                                  {getSimilarityLabel(duplicate.similarity)}
                                </span>
                                <Badge variant="outline">
                                  {(duplicate.similarity * 100).toFixed(1)}%
                                </Badge>
                              </div>
                              <Badge
                                variant={duplicate.matchType === 'active' ? 'default' : 'secondary'}
                              >
                                {duplicate.matchType === 'active' ? '활성' : '삭제됨'}
                              </Badge>
                            </div>
                            <div className="mt-2 text-sm">
                              <strong>매칭된 제목:</strong> {duplicate.matchedTitle}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {duplicate.matchDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {result.summary.exact > 0 && (
                          <span className="text-red-600 font-medium">
                            완전 중복 {result.summary.exact}개,{' '}
                          </span>
                        )}
                        {result.summary.high > 0 && (
                          <span className="text-orange-600 font-medium">
                            높은 유사도 {result.summary.high}개,{' '}
                          </span>
                        )}
                        {result.summary.medium > 0 && (
                          <span className="text-yellow-600 font-medium">
                            중간 유사도 {result.summary.medium}개
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 재생성 버튼 */}
            {filteredTitles.length > 0 && onRegenerateTitles && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      {filteredTitles.length}개의 제목에서 중복이 발견되었습니다. 
                      중복된 제목들을 제외하고 다시 생성하시겠습니까?
                    </span>
                    <Button
                      onClick={handleRegenerate}
                      variant="destructive"
                      className="ml-4"
                    >
                      중복 제목 재생성
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
