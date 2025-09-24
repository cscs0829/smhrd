'use client'

import React, { useState, useMemo } from 'react'
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Trash2, Download, Upload, RefreshCw, Settings, X } from 'lucide-react'
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
  onExport?: (data: TableRowData[]) => void
  onImport?: (file: File) => Promise<void>
}

export function TableDataManager({
  data,
  columns,
  onRefresh,
  onDelete,
  onExport,
  onImport
}: TableDataManagerProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState<TableRowData[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    if (filterType === 'all') return data
    
    return data.filter(item => {
      switch (filterType) {
        case 'recent':
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const createdAt = item.created_at || item.updated_at
          if (typeof createdAt === 'string' || typeof createdAt === 'number') {
            return new Date(createdAt) > oneWeekAgo
          }
          return false
        case 'active':
          return item.is_active !== false && item.status !== 'inactive'
        case 'inactive':
          return item.is_active === false || item.status === 'inactive'
        default:
          return true
      }
    })
  }, [data, filterType])

  const table = useReactTable({
    data: filteredData,
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
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="recent">최근 7일</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="inactive">비활성</SelectItem>
            </SelectContent>
          </Select>

          {filterType !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {filterType === 'recent' ? '최근 7일' : 
               filterType === 'active' ? '활성' : '비활성'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterType('all')}
              />
            </Badge>
          )}
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
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
    </div>
  )
}
