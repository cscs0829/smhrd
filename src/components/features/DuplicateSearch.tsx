'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Search, CheckCircle, XCircle, AlertCircle, Loader2, Database, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DuplicateCheckResponse {
  success: boolean
  exactMatch: boolean
  match?: {
    id: string
    title: string
    source: 'ep_data' | 'delect'
  }
  similarMatches: Array<{
    id: string
    title: string
    source: 'ep_data' | 'delect'
    similarity: number
    score: number
  }>
  message: string
}

export function DuplicateSearch() {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DuplicateCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/duplicate-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || '검색 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('중복 검사 오류:', error)
      setError('검색 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleReset = () => {
    setTitle('')
    setResult(null)
    setError(null)
  }

  const getSourceIcon = (source: 'ep_data' | 'delect') => {
    return source === 'ep_data' ? <Database className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />
  }

  const getSourceLabel = (source: 'ep_data' | 'delect') => {
    return source === 'ep_data' ? 'EP 데이터' : '삭제 테이블'
  }

  const getSourceColor = (source: 'ep_data' | 'delect') => {
    return source === 'ep_data' ? 'text-blue-600' : 'text-red-600'
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
            입력한 제목이 EP 데이터 테이블과 삭제 테이블에 중복되는지 확인하고, 유사한 제목도 찾아드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 검색 폼 */}
            <div className="space-y-2">
              <Label htmlFor="search-title">검색할 제목</Label>
              <div className="flex gap-2">
                <Input
                  id="search-title"
                  placeholder="중복을 확인할 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isLoading || !title.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      검색 중...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      검색
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 로딩 상태 */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>데이터베이스에서 검색 중...</span>
                  <span>잠시만 기다려주세요</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {/* 오류 메시지 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 검색 결과 */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">검색 결과</h3>
                    <Badge variant="outline">{title}</Badge>
                  </div>

                  {/* 정확한 일치 */}
                  {result.exactMatch && result.match && (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <div className="font-medium mb-2">정확히 일치하는 제목을 찾았습니다!</div>
                          <div className="flex items-center gap-2 text-sm">
                            {getSourceIcon(result.match.source)}
                            <span className={getSourceColor(result.match.source)}>
                              {getSourceLabel(result.match.source)}
                            </span>
                            <span className="text-gray-600">ID: {result.match.id}</span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* 유사한 제목들 */}
                  {result.similarMatches.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">
                            유사한 제목 ({result.similarMatches.length}개)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {result.similarMatches.map((match, index) => (
                              <motion.div
                                key={match.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.2 }}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {getSourceIcon(match.source)}
                                  <div>
                                    <div className="font-medium">{match.title}</div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <span className={getSourceColor(match.source)}>
                                        {getSourceLabel(match.source)}
                                      </span>
                                      <span>•</span>
                                      <span>ID: {match.id}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={match.similarity >= 80 ? "destructive" : match.similarity >= 60 ? "default" : "secondary"}
                                  >
                                    {match.similarity}% 유사
                                  </Badge>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* 전체 상태 요약 */}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                  >
                    <Card className={
                      result.exactMatch 
                        ? "border-red-200 bg-red-50" 
                        : result.similarMatches.length > 0
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-green-200 bg-green-50"
                    }>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          {result.exactMatch ? (
                            <>
                              <XCircle className="h-5 w-5 text-red-600" />
                              <span className="font-medium text-red-800">
                                정확히 일치하는 제목이 있습니다. 다른 제목을 사용하세요.
                              </span>
                            </>
                          ) : result.similarMatches.length > 0 ? (
                            <>
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              <span className="font-medium text-yellow-800">
                                유사한 제목이 {result.similarMatches.length}개 있습니다. 참고하세요.
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
                  </motion.div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                      새로 검색
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DuplicateSearch