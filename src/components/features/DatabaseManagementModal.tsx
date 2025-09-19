'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Save, X, Search, Filter } from 'lucide-react'

interface TableData {
  id: string | number
  [key: string]: unknown
}

interface DatabaseManagementModalProps {
  isOpen: boolean
  onClose: () => void
  tableName: string
  tableCount: number
}

const TABLE_SCHEMAS = {
  ep_data: {
    displayName: 'EP 데이터',
    columns: [
      { key: 'id', label: 'ID', type: 'text', editable: false },
      { key: 'title', label: '제목', type: 'text', editable: true },
      { key: 'price_pc', label: 'PC 가격', type: 'number', editable: true },
      { key: 'benefit_price', label: '혜택 가격', type: 'number', editable: true },
      { key: 'normal_price', label: '정가', type: 'number', editable: true },
      { key: 'link', label: '링크', type: 'url', editable: true },
      { key: 'mobile_link', label: '모바일 링크', type: 'url', editable: true },
      { key: 'image_link', label: '이미지 링크', type: 'url', editable: true },
      { key: 'add_image_link', label: '추가 이미지 링크', type: 'url', editable: true },
      { key: 'video_url', label: '비디오 URL', type: 'url', editable: true },
      { key: 'category_name1', label: '카테고리1', type: 'text', editable: true },
      { key: 'category_name2', label: '카테고리2', type: 'text', editable: true },
      { key: 'category_name3', label: '카테고리3', type: 'text', editable: true },
      { key: 'category_name4', label: '카테고리4', type: 'text', editable: true },
      { key: 'brand', label: '브랜드', type: 'text', editable: true },
      { key: 'maker', label: '제조사', type: 'text', editable: true },
      { key: 'origin', label: '원산지', type: 'text', editable: true },
      { key: 'age_group', label: '연령대', type: 'text', editable: true },
      { key: 'gender', label: '성별', type: 'text', editable: true },
      { key: 'city', label: '도시', type: 'text', editable: true },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false },
      { key: 'updated_at', label: '수정일', type: 'datetime', editable: false }
    ]
  },
  city_images: {
    displayName: '도시 이미지',
    columns: [
      { key: 'id', label: 'ID', type: 'number', editable: false },
      { key: 'city', label: '도시', type: 'text', editable: true },
      { key: 'image_link', label: '이미지 링크', type: 'url', editable: true },
      { key: 'is_main_image', label: '메인 이미지', type: 'boolean', editable: true },
      { key: 'video_url', label: '비디오 URL', type: 'url', editable: true },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false }
    ]
  },
  titles: {
    displayName: '제목',
    columns: [
      { key: 'id', label: 'ID', type: 'number', editable: false },
      { key: 'title', label: '제목', type: 'text', editable: true },
      { key: 'city', label: '도시', type: 'text', editable: true },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false }
    ]
  },
  api_keys: {
    displayName: 'API 키',
    columns: [
      { key: 'id', label: 'ID', type: 'number', editable: false },
      { key: 'provider', label: '제공업체', type: 'select', editable: true, options: ['openai', 'anthropic', 'google'] },
      { key: 'name', label: '이름', type: 'text', editable: true },
      { key: 'is_active', label: '활성 상태', type: 'boolean', editable: true },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false }
    ]
  },
  deleted_items: {
    displayName: '삭제된 항목',
    columns: [
      { key: 'id', label: 'ID', type: 'text', editable: false },
      { key: 'original_data', label: '원본 데이터', type: 'json', editable: false },
      { key: 'deleted_at', label: '삭제일', type: 'datetime', editable: false },
      { key: 'reason', label: '삭제 사유', type: 'text', editable: true }
    ]
  }
}

export function DatabaseManagementModal({ isOpen, onClose, tableName, tableCount }: DatabaseManagementModalProps) {
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(false)
  const [editingRow, setEditingRow] = useState<string | number | null>(null)
  const [editingData, setEditingData] = useState<TableData>({ id: '' })
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<unknown[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const tableSchema = TABLE_SCHEMAS[tableName as keyof typeof TABLE_SCHEMAS]

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/table-data?table=${tableName}&page=${pagination.pageIndex}&limit=${pagination.pageSize}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('데이터를 불러오는데 실패했습니다')
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      toast.error('데이터를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [tableName, pagination.pageIndex, pagination.pageSize])

  // 데이터 저장
  const saveData = useCallback(async (rowData: TableData) => {
    try {
      const isNew = !rowData.id || editingRow === 'new'
      const url = isNew 
        ? `/api/admin/table-data?table=${tableName}`
        : `/api/admin/table-data?table=${tableName}&id=${rowData.id}`
      
      const method = isNew ? 'POST' : 'PUT'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success(isNew ? '데이터가 추가되었습니다' : '데이터가 수정되었습니다')
        setEditingRow(null)
        setEditingData({})
        loadData()
      } else {
        toast.error(result.error || '저장에 실패했습니다')
      }
    } catch (error) {
      console.error('데이터 저장 오류:', error)
      toast.error('저장 중 오류가 발생했습니다')
    }
  }, [tableName, editingRow, loadData])

  // 데이터 삭제
  const deleteData = useCallback(async (id: string | number) => {
    if (!confirm('정말로 이 데이터를 삭제하시겠습니까?')) return

    try {
      const response = await fetch(`/api/admin/table-data?table=${tableName}&id=${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('데이터가 삭제되었습니다')
        loadData()
      } else {
        toast.error(result.error || '삭제에 실패했습니다')
      }
    } catch (error) {
      console.error('데이터 삭제 오류:', error)
      toast.error('삭제 중 오류가 발생했습니다')
    }
  }, [tableName, loadData])

  // 편집 시작
  const startEditing = (row: TableData) => {
    setEditingRow(row.id)
    setEditingData({ ...row })
  }

  // 편집 취소
  const cancelEditing = () => {
    setEditingRow(null)
    setEditingData({})
  }

  // 새 데이터 추가
  const addNew = () => {
    setEditingRow('new')
    setEditingData({})
  }

  // 컬럼 정의 생성
  const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => {
    if (!tableSchema) return []

    return tableSchema.columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      size: col.key === 'id' ? 80 : 150,
      enableColumnFilter: true,
      enableSorting: true,
      Cell: ({ cell, row }) => {
        const value = cell.getValue()
        
        if (editingRow === row.original.id) {
          // 편집 모드
          return (
            <div className="w-full">
              {col.type === 'boolean' ? (
                <Select
                  value={editingData[col.key] ? 'true' : 'false'}
                  onValueChange={(val) => setEditingData(prev => ({ ...prev, [col.key]: val === 'true' }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">예</SelectItem>
                    <SelectItem value="false">아니오</SelectItem>
                  </SelectContent>
                </Select>
              ) : col.type === 'select' && col.options ? (
                <Select
                  value={editingData[col.key] || ''}
                  onValueChange={(val) => setEditingData(prev => ({ ...prev, [col.key]: val }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {col.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={col.type === 'password' ? 'password' : col.type === 'number' ? 'number' : 'text'}
                  value={editingData[col.key] || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, [col.key]: e.target.value }))}
                  className="h-8"
                />
              )}
            </div>
          )
        } else {
          // 읽기 모드
          if (col.type === 'boolean') {
            return (
              <Badge variant={value ? 'default' : 'secondary'}>
                {value ? '예' : '아니오'}
              </Badge>
            )
          } else if (col.type === 'url' && value) {
            return (
              <a 
                href={value as string} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate block max-w-[200px]"
              >
                {value as string}
              </a>
            )
          } else if (col.type === 'datetime' && value) {
            return new Date(value as string).toLocaleString('ko-KR')
          } else if (col.type === 'json' && value) {
            return (
              <div className="max-w-[200px] truncate" title={JSON.stringify(value)}>
                {JSON.stringify(value).substring(0, 50)}...
              </div>
            )
          }
          return <div className="truncate max-w-[200px]">{value as string}</div>
        }
      },
      Footer: () => {
        if (editingRow === 'new') {
          return (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveData(editingData)}>
                <Save className="h-4 w-4 mr-1" />
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
            </div>
          )
        }
        return null
      }
    })).concat([
      // 액션 컬럼
      {
        id: 'actions',
        header: '액션',
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
          if (editingRow === row.original.id) {
            return (
              <div className="flex gap-1">
                <Button size="sm" onClick={() => saveData(editingData)}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEditing}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          }
          return (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => startEditing(row.original)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => deleteData(row.original.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        }
      }
    ])
  }, [tableSchema, editingRow, editingData, saveData, deleteData])

  // 테이블 설정
  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enablePagination: true,
    enableRowActions: false,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    state: {
      globalFilter,
      columnFilters,
      pagination
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    renderTopToolbarCustomActions: () => (
      <Button onClick={addNew} disabled={editingRow !== null}>
        <Plus className="h-4 w-4 mr-2" />
        새 데이터 추가
      </Button>
    ),
    renderToolbarInternalActions: () => (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData()}
          disabled={loading}
        >
          <Search className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>
    ),
    muiTableContainerProps: {
      sx: { maxHeight: '600px' }
    },
    muiTableHeadCellProps: {
      sx: { fontSize: '0.875rem', fontWeight: 600 }
    },
    muiTableBodyCellProps: {
      sx: { fontSize: '0.875rem' }
    }
  })

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (isOpen && tableName) {
      loadData()
    }
  }, [isOpen, tableName, pagination.pageIndex, pagination.pageSize, loadData])

  if (!tableSchema) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>알 수 없는 테이블</DialogTitle>
            <DialogDescription>
              선택한 테이블을 찾을 수 없습니다.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {tableSchema.displayName} 관리
          </DialogTitle>
          <DialogDescription>
            총 {tableCount.toLocaleString()}개의 데이터를 관리할 수 있습니다. 
            필터링, 검색, 편집, 삭제 기능을 사용하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <MaterialReactTable table={table} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
