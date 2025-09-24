'use client'

import React, { useState } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Trash2, Download, Upload, RefreshCw, Settings } from 'lucide-react'
import { toast } from 'sonner'

// 타입 정의
interface TableRowData {
  id: string | number
  [key: string]: unknown
}

interface TableDataManagerProps {
  tableName: string
  data: TableRowData[]
  columns: ColumnDef<TableRowData>[]
  onRefresh?: () => void
  onDelete?: (ids: string[]) => Promise<void>
  onDeleteAll?: () => Promise<void>
  onExport?: (data: TableRowData[]) => void
  onImport?: (file: File) => Promise<void>
}

export function TableDataManager({
  data,
  columns,
  onRefresh,
  onDelete,
  onDeleteAll,
  onExport,
  onImport,
  tableName,
}: TableDataManagerProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<TableRowData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  // 테이블 총 개수 가져오기
  React.useEffect(() => {
    let isMounted = true
    async function fetchCount() {
      try {
        const res = await fetch('/api/admin/table-data/count')
        const json: { success?: boolean; counts?: Record<string, number> } = await res.json()
        if (!res.ok || !json?.success) return
        const count = json.counts?.[tableName]
        if (isMounted) setTotalCount(typeof count === 'number' ? count : data.length)
      } catch {
        if (isMounted) setTotalCount(data.length)
      }
    }
    fetchCount()
    return () => { isMounted = false }
  }, [tableName, data.length])

  // 페이지 옵션 계산
  const pageOptions = React.useMemo(() => {
    const base = [10, 20, 50, 100]
    if (!totalCount) return base
    const extra: number[] = []
    if (totalCount > 100) extra.push(200)
    if (totalCount > 200) extra.push(500)
    if (totalCount > 500) extra.push(1000)
    if (totalCount > 1000 && totalCount <= 5000) extra.push(2000)
    if (totalCount > 5000) extra.push(5000)
    return Array.from(new Set([...base, ...extra]))
  }, [totalCount])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  // 기본 페이지 사이즈를 동적으로 설정 (총 개수 기반)
  if (table.getState().pagination.pageSize === 10) {
    const defaultSize = totalCount && totalCount > 100 ? 100 : 50
    table.setPageSize(defaultSize)
  }

  const handleDelete = async () => {
    if (!onDelete || selectedRows.length === 0) return

    try {
      setIsLoading(true)
      const ids = selectedRows.map(row => String(row.id || row.product_id || ''))
      await onDelete(ids)
      toast.success(`${selectedRows.length}개 항목이 삭제되었습니다`)
      setDeleteDialogOpen(false)
      setSelectedRows([])
      table.resetRowSelection()
      onRefresh?.()
    } catch (error) {
      toast.error('삭제 중 오류가 발생했습니다')
      console.error('Delete error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!onDeleteAll) return

    try {
      setIsLoading(true)
      await onDeleteAll()
      toast.success('모든 항목이 삭제되었습니다')
      setDeleteAllDialogOpen(false)
      table.resetRowSelection()
      onRefresh?.()
    } catch (error) {
      toast.error('전체 삭제 중 오류가 발생했습니다')
      console.error('Delete all error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkAction = (action: string) => {
    const selected = table.getFilteredSelectedRowModel().rows.map(row => row.original)
    setSelectedRows(selected)
    
    switch (action) {
      case 'delete':
        setDeleteDialogOpen(true)
        break
      case 'export':
        onExport?.(selected)
        break
      default:
        break
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImport) {
      onImport(file)
    }
  }

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="전체 검색..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          
        </div>

        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          
          {onImport && (
            <Button variant="outline" size="sm" asChild>
              <label>
                <Upload className="h-4 w-4 mr-2" />
                가져오기
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.json"
                  onChange={handleFileImport}
                />
              </label>
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport(data)}>
              <Download className="h-4 w-4 mr-2" />
              내보내기
            </Button>
          )}

          {onDeleteAll && data.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteAllDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              전체 삭제
            </Button>
          )}

          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  일괄 작업 ({table.getFilteredSelectedRowModel().rows.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>선택된 항목</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onExport && (
                  <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                    <Download className="h-4 w-4 mr-2" />
                    선택 항목 내보내기
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    선택 항목 삭제
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table className="w-full table-auto">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-left px-4 py-2 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-left px-4 py-2 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length}개 선택됨 / 총 {table.getFilteredRowModel().rows.length}개
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">페이지당 행 수</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value))
            }}
            className="h-8 w-24 rounded border border-input bg-background px-2 text-sm"
          >
            {pageOptions.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            다음
          </Button>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>항목 삭제 확인</DialogTitle>
            <DialogDescription>
              선택한 {selectedRows.length}개 항목을 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 전체 삭제 확인 다이얼로그 */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>전체 삭제 확인</DialogTitle>
            <DialogDescription>
              테이블의 모든 데이터({data.length}개 항목)를 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAllDialogOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              disabled={isLoading}
            >
              {isLoading ? '삭제 중...' : '전체 삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
