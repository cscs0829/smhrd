'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface TableCounts {
  ep_data: number
  city_images: number
  titles: number
  api_keys: number
  deleted_items: number
}

interface RecentData {
  ep_data: Array<{
    id: string
    title: string
    city: string
    created_at: string
  }>
  city_images: Array<{
    id: number
    city: string
    image_link: string
    is_main_image: number
  }>
  api_keys: Array<{
    id: number
    provider: string
    name: string
    is_active: boolean
    created_at: string
  }>
}

interface DbStatus {
  tableCounts: TableCounts
  recentData: RecentData
  connectionStatus: 'connected' | 'error'
}

export function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const loadDbStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/db-status')
      const result = await response.json()
      
      if (result.success) {
        setDbStatus(result.data)
        toast.success('데이터베이스 연결 상태를 확인했습니다')
      } else {
        toast.error('데이터베이스 연결에 실패했습니다')
      }
    } catch (error) {
      console.error('데이터베이스 상태 확인 오류:', error)
      toast.error('데이터베이스 상태를 확인할 수 없습니다')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDbStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  if (!dbStatus) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">데이터베이스 상태를 확인하려면 새로고침 버튼을 클릭하세요</p>
        <Button onClick={loadDbStatus} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>
    )
  }

  // recentData가 없을 경우를 위한 기본값 설정
  const safeRecentData = dbStatus.recentData || {
    ep_data: [],
    city_images: [],
    api_keys: []
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                데이터베이스 상태
              </CardTitle>
              <CardDescription>
                Supabase 데이터베이스 연결 상태 및 테이블 정보를 확인하세요
              </CardDescription>
            </div>
            <Button 
              onClick={loadDbStatus} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">데이터베이스 상태를 확인하는 중...</p>
            </div>
          ) : dbStatus ? (
            <div className="space-y-6">
              {/* 연결 상태 */}
              <div className="flex items-center gap-2">
                {getStatusIcon(dbStatus.connectionStatus)}
                <span className="font-medium">연결 상태:</span>
                <Badge className={getStatusColor(dbStatus.connectionStatus)}>
                  {dbStatus.connectionStatus === 'connected' ? '연결됨' : '연결 실패'}
                </Badge>
              </div>

              {/* 테이블별 데이터 개수 */}
              <div>
                <h3 className="font-medium mb-3">테이블별 데이터 개수</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(dbStatus.tableCounts).map(([tableName, count]) => (
                    <div key={tableName} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{count.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 capitalize">{tableName.replace('_', ' ')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 데이터 샘플 */}
              <div className="space-y-4">
                {/* EP 데이터 */}
                {safeRecentData.ep_data?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">최근 EP 데이터 (상위 5개)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>제목</TableHead>
                          <TableHead>도시</TableHead>
                          <TableHead>생성일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {safeRecentData.ep_data?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-mono text-xs">{item.id}</TableCell>
                            <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                            <TableCell>{item.city}</TableCell>
                            <TableCell className="text-sm">{formatDate(item.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* 도시 이미지 데이터 */}
                {safeRecentData.city_images?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">최근 도시 이미지 데이터 (상위 5개)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>도시</TableHead>
                          <TableHead>이미지 링크</TableHead>
                          <TableHead>메인 이미지</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {safeRecentData.city_images?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>{item.city}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              <a href={item.image_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {item.image_link}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.is_main_image === 1 ? 'default' : 'secondary'}>
                                {item.is_main_image === 1 ? '메인' : '추가'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* API 키 데이터 */}
                {safeRecentData.api_keys?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">등록된 API 키 (상위 5개)</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>제공업체</TableHead>
                          <TableHead>이름</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>생성일</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {safeRecentData.api_keys?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.id}</TableCell>
                            <TableCell>
                              <Badge className={item.provider === 'openai' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {item.provider.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>
                              <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                {item.is_active ? '활성' : '비활성'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{formatDate(item.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">데이터베이스 상태를 불러올 수 없습니다</p>
              <Button onClick={loadDbStatus} className="mt-4">
                다시 시도
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
