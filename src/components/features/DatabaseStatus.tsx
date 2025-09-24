'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface TableCounts {
  ep_data: number
  delete: number
  api_keys: number
}

interface RecentData {
  ep_data: Array<{
    id: string
    title: string
    created_at: string
  }>
  delete: Array<{
    id: number
    product_id: string
    title: string
    reason: string
    created_at: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchDbStatus = useCallback(async () => {
    try {
      setIsRefreshing(true)
      
      const response = await fetch('/api/admin/db-status')
      if (!response.ok) {
        throw new Error('데이터베이스 상태 조회 실패')
      }
      
      const data = await response.json()
      setDbStatus(data)
    } catch (error) {
      console.error('데이터베이스 상태 조회 오류:', error)
      toast.error('데이터베이스 상태 조회에 실패했습니다')
      setDbStatus(null)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDbStatus()
  }, [fetchDbStatus])

  useEffect(() => {
    if (onRefresh !== undefined) {
      fetchDbStatus()
    }
  }, [onRefresh, fetchDbStatus])

  const handleRefresh = () => {
    fetchDbStatus()
    toast.success('데이터베이스 상태를 새로고침했습니다')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>데이터베이스 상태를 확인하는 중...</span>
        </CardContent>
      </Card>
    )
  }

  if (!dbStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <XCircle className="h-6 w-6 text-red-500 mr-2" />
          <span>데이터베이스 연결에 실패했습니다</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 연결 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            데이터베이스 연결 상태
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {dbStatus.connectionStatus === 'connected' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700 font-medium">연결됨</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700 font-medium">연결 실패</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 테이블 카운트 */}
      <Card>
        <CardHeader>
          <CardTitle>테이블 데이터 현황</CardTitle>
          <CardDescription>
            각 테이블의 데이터 개수를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">EP 데이터</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dbStatus.tableCounts.ep_data.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">삭제된 아이템</p>
                <p className="text-2xl font-bold text-red-600">
                  {dbStatus.tableCounts.delete.toLocaleString()}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">API 키</p>
                <p className="text-2xl font-bold text-green-600">
                  {dbStatus.tableCounts.api_keys.toLocaleString()}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 최근 EP 데이터 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 EP 데이터</CardTitle>
          <CardDescription>
            최근에 추가된 EP 데이터를 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbStatus.recentData.ep_data.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>생성일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dbStatus.recentData.ep_data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.id}</TableCell>
                      <TableCell title={item.title}>
                        {truncateText(item.title)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(item.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              최근 EP 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 삭제된 아이템 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 삭제된 아이템</CardTitle>
          <CardDescription>
            최근에 삭제된 아이템들을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dbStatus.recentData.delete.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>상품ID</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>삭제 이유</TableHead>
                    <TableHead>삭제일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dbStatus.recentData.delete.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.product_id}</TableCell>
                      <TableCell title={item.title}>
                        {truncateText(item.title)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.reason}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(item.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              최근 삭제된 아이템이 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabaseStatus