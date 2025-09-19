'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useSpring, animated } from '@react-spring/web' // Context7 React Spring 패턴
import { DatabaseManagementModal } from './DatabaseManagementModal'
import { useTheme } from 'next-themes'

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

interface DatabaseStatusProps {
  onRefresh?: number
}

export function DatabaseStatus({ onRefresh }: DatabaseStatusProps) {
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [managementModal, setManagementModal] = useState<{
    isOpen: boolean
    tableName: string
    tableCount: number
  }>({
    isOpen: false,
    tableName: '',
    tableCount: 0
  })
  const { resolvedTheme: _resolvedTheme } = useTheme()

  // Context7 React Spring 패턴: 새로고침 애니메이션
  const [refreshSprings, refreshApi] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: { tension: 300, friction: 20 }
  }))

  // Context7 React Spring 패턴: 컴포넌트 마운트 애니메이션
  const [mountSprings] = useSpring(() => ({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 300, friction: 30 }
  }))

  const loadDbStatus = useCallback(async () => {
    try {
      setLoading(true)
      
      // Context7 React Spring 패턴: 새로고침 애니메이션 트리거
      refreshApi.start({
        from: { scale: 1, rotate: 0 },
        to: [
          { scale: 0.95, rotate: 180 },
          { scale: 1, rotate: 360 }
        ],
        onRest: () => {
          refreshApi.start({ scale: 1, rotate: 0 })
        }
      })
      
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
  }, [refreshApi])

  useEffect(() => {
    loadDbStatus()
  }, [loadDbStatus])

  // onRefresh prop이 변경되면 데이터 새로고침
  useEffect(() => {
    if (onRefresh && onRefresh > 0) {
      loadDbStatus()
    }
  }, [onRefresh, loadDbStatus])

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

  const openManagementModal = (tableName: string, tableCount: number) => {
    setManagementModal({
      isOpen: true,
      tableName,
      tableCount
    })
  }

  const closeManagementModal = () => {
    setManagementModal({
      isOpen: false,
      tableName: '',
      tableCount: 0
    })
  }

  if (!dbStatus) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">데이터베이스 상태를 확인하려면 새로고침 버튼을 클릭하세요</p>
        <animated.div
          style={{
            ...refreshSprings
          }}
        >
          <Button onClick={loadDbStatus} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </animated.div>
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
    <animated.div 
      className="space-y-4"
      style={mountSprings}
    >
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
            <animated.div
              style={{
                ...refreshSprings
              }}
            >
              <Button
                onClick={loadDbStatus}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </animated.div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">데이터베이스 상태를 확인하는 중...</p>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">테이블별 데이터 개수</h3>
                  <Badge variant="outline" className="text-xs">
                    관리 모달을 클릭하여 데이터를 편집하세요
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(dbStatus.tableCounts).map(([tableName, count]) => (
                    <div 
                      key={tableName} 
                      className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group border border-gray-200 dark:border-gray-700"
                      onClick={() => openManagementModal(tableName, count)}
                    >
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        {count.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 capitalize mb-2">
                        {tableName.replace('_', ' ')}
                      </div>
                      <Button size="sm" variant="outline" className="h-6 text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        관리
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최근 데이터 샘플 */}
              <div className="space-y-4">
                {/* EP 데이터 */}
                {safeRecentData.ep_data?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">최근 EP 데이터 (상위 5개)</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-gray-700 dark:text-gray-300">ID</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">제목</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">도시</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">생성일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(safeRecentData.ep_data || []).map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="font-mono text-xs text-gray-600 dark:text-gray-400">{item.id}</TableCell>
                              <TableCell className="max-w-xs truncate text-gray-900 dark:text-gray-100">{item.title}</TableCell>
                              <TableCell className="text-gray-700 dark:text-gray-300">{item.city}</TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(item.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 도시 이미지 데이터 */}
                {safeRecentData.city_images?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">최근 도시 이미지 데이터 (상위 5개)</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-gray-700 dark:text-gray-300">ID</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">도시</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">이미지 링크</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">메인 이미지</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(safeRecentData.city_images || []).map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="text-gray-700 dark:text-gray-300">{item.id}</TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100">{item.city}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                <a href={item.image_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
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
                  </div>
                )}

                {/* API 키 데이터 */}
                {safeRecentData.api_keys?.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">등록된 API 키 (상위 5개)</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            <TableHead className="text-gray-700 dark:text-gray-300">ID</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">제공업체</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">이름</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">상태</TableHead>
                            <TableHead className="text-gray-700 dark:text-gray-300">생성일</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(safeRecentData.api_keys || []).map((item) => (
                            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <TableCell className="text-gray-700 dark:text-gray-300">{item.id}</TableCell>
                              <TableCell>
                                <Badge className={item.provider === 'openai' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                }>
                                  {item.provider.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100">{item.name}</TableCell>
                              <TableCell>
                                <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                  {item.is_active ? '활성' : '비활성'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(item.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">데이터베이스 상태를 불러올 수 없습니다</p>
              <Button onClick={loadDbStatus} className="mt-4">
                다시 시도
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 데이터베이스 관리 모달 */}
      <DatabaseManagementModal
        isOpen={managementModal.isOpen}
        onClose={closeManagementModal}
        tableName={managementModal.tableName}
        tableCount={managementModal.tableCount}
      />
    </animated.div>
  )
}
