'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Settings, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { TableDataManager } from './TableDataManager'
import { 
  epDataColumns, 
  deletedItemsColumns, 
  apiKeyColumns
} from './TableColumnsNew'
import { ColumnDef } from '@tanstack/react-table'
import { TABLE_NAMES, type DatabaseStatus as DbStatusType } from '@/types/database'

// 공통 타입 정의
interface TableRowData {
  id: string | number
  [key: string]: unknown
}



interface DatabaseStatusProps {
  onRefresh?: number
}

export function DatabaseStatus({ onRefresh }: DatabaseStatusProps) {
  const [dbStatus, setDbStatus] = useState<DbStatusType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTable, setActiveTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<TableRowData[]>([])
  const [isTableLoading, setIsTableLoading] = useState(false)

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

  // 저장/삭제 후 테이블 새로고침을 위한 글로벌 이벤트 리스너는
  // fetchTableData 선언 이후에 등록한다.

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

  const fetchTableData = async (tableName: string) => {
    try {
      setIsTableLoading(true)
      // Supabase 1000개 제한 우회: API를 페이지네이션으로 반복 호출
      const limit = 1000
      let page = 1
      let allRows: TableRowData[] = []
      while (true) {
        const url = `/api/admin/table-data?table=${tableName}&page=${page}&limit=${limit}`
        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = (errorData as any).error || '테이블 데이터 조회 실패'
          throw new Error(errorMessage)
        }
        const result = await response.json()
        const chunk: TableRowData[] = result.data || []
        allRows = allRows.concat(chunk)
        if (chunk.length < limit) break
        page += 1
      }
      
      // 데이터가 없는 경우
      if (!allRows || allRows.length === 0) {
        toast.info(`${getTableDisplayName(tableName)} 테이블에 데이터가 없습니다`)
        setTableData([])
        setActiveTable(tableName)
        return
      }
      
      setTableData(allRows)
      setActiveTable(tableName)
      toast.success(`${getTableDisplayName(tableName)} 데이터를 불러왔습니다 (${allRows.length}개)`)
    } catch (error) {
      console.error('테이블 데이터 조회 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      toast.error(`${getTableDisplayName(tableName)} 데이터 조회 실패: ${errorMessage}`)
    } finally {
      setIsTableLoading(false)
    }
  }

  const handleDeleteData = async (ids: string[]) => {
    try {
      const response = await fetch('/api/admin/delete-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          table: activeTable,
          ids 
        }),
      })
      
      if (!response.ok) {
        throw new Error('데이터 삭제 실패')
      }
      
      toast.success('데이터가 삭제되었습니다')
      if (activeTable) {
        fetchTableData(activeTable)
      }
      fetchDbStatus()
    } catch (error) {
      console.error('데이터 삭제 오류:', error)
      toast.error('데이터 삭제에 실패했습니다')
    }
  }

  // 저장/삭제 후 테이블 새로고침을 위한 글로벌 이벤트 리스너
  useEffect(() => {
    const handler = () => {
      if (activeTable) {
        fetchTableData(activeTable)
      }
      fetchDbStatus()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('admin-table-refresh', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('admin-table-refresh', handler as EventListener)
      }
    }
  }, [activeTable, fetchTableData, fetchDbStatus])

  const handleExportData = (data: TableRowData[]) => {
    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTable}_data.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getTableColumns = (tableName: string): ColumnDef<TableRowData>[] => {
    switch (tableName) {
      case TABLE_NAMES.EP_DATA:
        return epDataColumns as ColumnDef<TableRowData>[]
      case TABLE_NAMES.DELETED_ITEMS:
        return deletedItemsColumns as ColumnDef<TableRowData>[]
      case TABLE_NAMES.API_KEYS:
        return apiKeyColumns as ColumnDef<TableRowData>[]
      default:
        return []
    }
  }

  const getTableDisplayName = (tableName: string) => {
    switch (tableName) {
      case TABLE_NAMES.EP_DATA:
        return 'EP 데이터'
      case TABLE_NAMES.DELETED_ITEMS:
        return '삭제된 아이템'
      case TABLE_NAMES.API_KEYS:
        return 'API 키'
      default:
        return tableName
    }
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
            각 테이블의 데이터 개수를 확인하고 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                     <div className="flex-1">
                       <p className="text-sm font-medium text-gray-600">EP 데이터</p>
                       <p className="text-2xl font-bold text-blue-600">
                         {dbStatus.tableCounts.ep_data.toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <Database className="h-8 w-8 text-blue-400" />
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => fetchTableData(TABLE_NAMES.EP_DATA)}
                         disabled={isTableLoading}
                       >
                         <Settings className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>

                   <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                     <div className="flex-1">
                       <p className="text-sm font-medium text-gray-600">삭제된 아이템</p>
                       <p className="text-2xl font-bold text-red-600">
                         {dbStatus.tableCounts.deleted_items.toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <XCircle className="h-8 w-8 text-red-400" />
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => fetchTableData(TABLE_NAMES.DELETED_ITEMS)}
                         disabled={isTableLoading}
                       >
                         <Settings className="h-4 w-4" />
                       </Button>
                     </div>
                   </div>

                   <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                     <div className="flex-1">
                       <p className="text-sm font-medium text-gray-600">API 키</p>
                       <p className="text-2xl font-bold text-green-600">
                         {dbStatus.tableCounts.api_keys.toLocaleString()}
                       </p>
                     </div>
                     <div className="flex items-center gap-2">
                       <AlertTriangle className="h-8 w-8 text-green-400" />
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => fetchTableData(TABLE_NAMES.API_KEYS)}
                         disabled={isTableLoading}
                       >
                         <Settings className="h-4 w-4" />
                       </Button>
                     </div>
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
          {dbStatus.recentData.deleted_items.length > 0 ? (
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
                  {dbStatus.recentData.deleted_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.original_id}</TableCell>
                      <TableCell title={item.original_data?.title || 'N/A'}>
                        {truncateText(item.original_data?.title || 'N/A')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{item.reason || 'N/A'}</Badge>
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

      {/* 테이블 데이터 관리 모달 */}
      {activeTable && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <CardHeader className="sticky top-0 bg-background border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {getTableDisplayName(activeTable)} 관리
                  </CardTitle>
                  <CardDescription>
                    {getTableDisplayName(activeTable)} 데이터를 검색, 필터링, 수정, 삭제할 수 있습니다.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTable(null)}
                >
                  닫기
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto max-h-[calc(90vh-120px)]">
              {isTableLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>데이터를 불러오는 중...</span>
                </div>
              ) : (
                <TableDataManager
                  tableName={activeTable}
                  data={tableData}
                  columns={getTableColumns(activeTable)}
                  onRefresh={() => fetchTableData(activeTable)}
                  onDelete={handleDeleteData}
                  onExport={handleExportData}
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default DatabaseStatus