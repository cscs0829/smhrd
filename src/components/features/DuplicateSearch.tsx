'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, CheckCircle, XCircle, AlertTriangle, Loader2, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSpring, animated } from '@react-spring/web' // Context7 React Spring 패턴

interface SearchResult {
  id: string
  title: string
  city: string
  type: 'ep_data' | 'deleted_items'
  created_at: string
  match_type: 'exact' | 'partial'
}

export function DuplicateSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Context7 React Spring 패턴: 검색 애니메이션
  const [searchSprings, searchApi] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    config: { tension: 300, friction: 20 }
  }))

  // Context7 React Spring 패턴: 결과 애니메이션
  const [resultSprings, resultApi] = useSpring(() => ({
    opacity: 1,
    y: 0,
    config: { tension: 300, friction: 30 }
  }))

  // Context7 React Spring 패턴: 컴포넌트 마운트 애니메이션
  const [mountSprings] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 300, friction: 30 }
  }))

  const searchDuplicates = async () => {
    if (!searchTerm.trim()) {
      toast.error('검색할 제목을 입력해주세요')
      return
    }

    try {
      setLoading(true)
      
      // Context7 React Spring 패턴: 검색 애니메이션 트리거
      searchApi.start({
        from: { scale: 1, opacity: 1 },
        to: [
          { scale: 0.95, opacity: 0.8 },
          { scale: 1, opacity: 1 }
        ]
      })

      const response = await fetch('/api/duplicate-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: searchTerm.trim() })
      })

      if (!response.ok) {
        throw new Error('검색에 실패했습니다')
      }

      const result = await response.json()
      setSearchResults(result.data || [])
      setHasSearched(true)

      // Context7 React Spring 패턴: 결과 애니메이션
      resultApi.start({
        from: { opacity: 0, y: 20 },
        to: { opacity: 1, y: 0 }
      })

      if (result.data && result.data.length > 0) {
        toast.success(`${result.data.length}개의 중복 항목을 찾았습니다`)
      } else {
        toast.info('중복된 항목을 찾지 못했습니다')
      }
    } catch (error) {
      console.error('중복 검색 오류:', error)
      const message = error instanceof Error ? error.message : '검색 중 오류가 발생했습니다'
      toast.error(message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchDuplicates()
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ep_data':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'deleted_items':
        return <Trash2 className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ep_data':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">EP 데이터</Badge>
      case 'deleted_items':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">삭제된 항목</Badge>
      default:
        return <Badge variant="secondary">알 수 없음</Badge>
    }
  }

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getMatchTypeText = (matchType: string) => {
    switch (matchType) {
      case 'exact':
        return '정확히 일치'
      case 'partial':
        return '부분 일치'
      default:
        return '알 수 없음'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <animated.div 
      className="space-y-6"
      style={mountSprings}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            중복 검색기
          </CardTitle>
          <CardDescription>
            EP 데이터와 삭제된 항목에서 동일한 제목을 검색합니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 검색 입력 */}
            <div className="space-y-2">
              <Label htmlFor="search-term">검색할 제목</Label>
              <animated.div
                style={{
                  ...searchSprings
                }}
              >
                <div className="flex gap-2">
                  <Input
                    id="search-term"
                    placeholder="검색할 제목을 입력하세요"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={searchDuplicates}
                    disabled={loading || !searchTerm.trim()}
                    className="px-6"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    검색
                  </Button>
                </div>
              </animated.div>
            </div>

            {/* 검색 결과 */}
            {hasSearched && (
              <animated.div
                style={{
                  ...resultSprings
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">검색 결과</h3>
                    <Badge variant="outline" className="text-sm">
                      총 {searchResults.length}개
                    </Badge>
                  </div>

                  {searchResults.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        &apos;{searchTerm}&apos;와 일치하는 항목을 찾지 못했습니다.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>타입</TableHead>
                            <TableHead>제목</TableHead>
                            <TableHead>도시</TableHead>
                            <TableHead>일치 유형</TableHead>
                            <TableHead>생성일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {searchResults.map((result, index) => (
                            <animated.tr
                              key={`${result.type}-${result.id}`}
                              style={{
                                opacity: resultSprings.opacity,
                                transform: resultSprings.y.to(y => `translateY(${y + index * 10}px)`)
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getTypeIcon(result.type)}
                                  {getTypeBadge(result.type)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <p className="font-medium truncate" title={result.title}>
                                    {result.title}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{result.city}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getMatchTypeIcon(result.match_type)}
                                  <span className="text-sm">
                                    {getMatchTypeText(result.match_type)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm text-gray-500">
                                  {formatDate(result.created_at)}
                                </span>
                              </TableCell>
                            </animated.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </animated.div>
            )}
          </div>
        </CardContent>
      </Card>
    </animated.div>
  )
}
