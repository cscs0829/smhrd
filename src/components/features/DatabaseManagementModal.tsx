'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_ColumnFiltersState, type MRT_Cell, type MRT_Row } from 'material-react-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Save, X, Search, Filter, FilterX, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMediaQuery } from '@mui/material'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface TableData {
  id: string | number
  [key: string]: unknown
}

interface FilterCondition {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'isNull' | 'isNotNull'
  value: string | number
  value2?: string | number // for 'between' operator
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
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [advancedFilters, setAdvancedFilters] = useState<FilterCondition[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  
  // 반응형 모달 크기 설정
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

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
        setEditingData({ id: '' })
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
    setEditingData({ id: '' })
  }

  // 새 데이터 추가
  const addNew = () => {
    setEditingRow('new')
    setEditingData({ id: '' })
  }

  // 필터 조건 추가
  const addFilter = () => {
    setAdvancedFilters(prev => [...prev, {
      column: tableSchema?.columns[0]?.key || 'id',
      operator: 'contains',
      value: ''
    }])
  }

  // 필터 조건 제거
  const removeFilter = (index: number) => {
    setAdvancedFilters(prev => prev.filter((_, i) => i !== index))
  }

  // 필터 조건 업데이트
  const updateFilter = (index: number, field: keyof FilterCondition, value: string | number) => {
    setAdvancedFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [field]: value } : filter
    ))
  }

  // 필터 초기화
  const resetFilters = () => {
    setAdvancedFilters([])
    setGlobalFilter('')
    setColumnFilters([])
  }

  // 필터 적용된 데이터 필터링
  const getFilteredData = useCallback((data: TableData[]) => {
    if (advancedFilters.length === 0) return data

    return data.filter(item => {
      return advancedFilters.every(filter => {
        const cellValue = item[filter.column]
        
        if (filter.operator === 'isNull') {
          return cellValue === null || cellValue === undefined || cellValue === ''
        }
        
        if (filter.operator === 'isNotNull') {
          return cellValue !== null && cellValue !== undefined && cellValue !== ''
        }

        if (cellValue === null || cellValue === undefined) return false

        const stringValue = String(cellValue).toLowerCase()
        const filterValue = String(filter.value).toLowerCase()

        switch (filter.operator) {
          case 'equals':
            return stringValue === filterValue
          case 'contains':
            return stringValue.includes(filterValue)
          case 'startsWith':
            return stringValue.startsWith(filterValue)
          case 'endsWith':
            return stringValue.endsWith(filterValue)
          case 'greaterThan':
            return Number(cellValue) > Number(filter.value)
          case 'lessThan':
            return Number(cellValue) < Number(filter.value)
          case 'between':
            const numValue = Number(cellValue)
            const minValue = Number(filter.value)
            const maxValue = Number(filter.value2)
            return numValue >= minValue && numValue <= maxValue
          default:
            return true
        }
      })
    })
  }, [advancedFilters])

  // 필터된 데이터
  const filteredData = useMemo(() => {
    return getFilteredData(data)
  }, [data, getFilteredData])

  // 컬럼 정의 생성
  const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => {
    if (!tableSchema) return []

    return tableSchema.columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      size: col.key === 'id' ? 80 : 150,
      enableColumnFilter: true,
      enableSorting: true,
      Cell: ({ cell, row }: { cell: MRT_Cell<TableData>; row: MRT_Row<TableData> }) => {
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
                  <SelectTrigger className="h-8 bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-input">
                    <SelectItem value="true">예</SelectItem>
                    <SelectItem value="false">아니오</SelectItem>
                  </SelectContent>
                </Select>
              ) : col.type === 'select' && 'options' in col && col.options ? (
                <Select
                  value={String(editingData[col.key] || '')}
                  onValueChange={(val) => setEditingData(prev => ({ ...prev, [col.key]: val }))}
                >
                  <SelectTrigger className="h-8 bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-input">
                    {col.options.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={col.type === 'password' ? 'password' : col.type === 'number' ? 'number' : 'text'}
                  value={String(editingData[col.key] || '')}
                  onChange={(e) => setEditingData(prev => ({ ...prev, [col.key]: e.target.value }))}
                  className="h-8 bg-background border-input"
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
                className="text-blue-600 dark:text-blue-400 hover:underline truncate block max-w-[200px]"
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
        accessorKey: 'actions',
        header: '액션',
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }: { row: MRT_Row<TableData> }) => {
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
        },
        Footer: () => null
      }
    ])
  }, [tableSchema, editingRow, editingData, saveData, deleteData])

  // 테이블 설정
  const table = useMaterialReactTable({
    columns,
    data: filteredData,
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
    // 다크모드 지원을 위한 테마 설정
    mrtTheme: {
      baseBackgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
      draggingBorderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
      matchHighlightColor: resolvedTheme === 'dark' ? '#fbbf24' : '#fde047',
      menuBackgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f9fafb',
      pinnedRowBackgroundColor: resolvedTheme === 'dark' ? '#1e40af' : '#dbeafe',
      selectedRowBackgroundColor: resolvedTheme === 'dark' ? '#1e3a8a' : '#bfdbfe',
    },
    // 테이블 컨테이너 스타일링
    muiTableContainerProps: {
      sx: { 
        maxHeight: isMobile ? '70vh' : '60vh',
        minHeight: isMobile ? '200px' : '300px',
        position: 'relative',
        zIndex: 1,
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f1f5f9',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: resolvedTheme === 'dark' ? '#6b7280' : '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: resolvedTheme === 'dark' ? '#9ca3af' : '#94a3b8',
          },
        },
      }
    },
    // 테이블 페이퍼 스타일링
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '12px',
        border: `1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
        backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
        boxShadow: resolvedTheme === 'dark' 
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        zIndex: 1,
        '& .MuiBox-root': {
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'auto',
        },
        '& .MuiSelect-root': {
          position: 'relative',
          zIndex: 3,
          pointerEvents: 'auto',
        },
        '& .MuiInputBase-root': {
          position: 'relative',
          zIndex: 3,
          pointerEvents: 'auto',
        },
        '& .MuiPagination-root': {
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'auto',
        },
        '& .MuiPaginationItem-root': {
          position: 'relative',
          zIndex: 3,
          pointerEvents: 'auto',
        },
      }
    },
    // 헤더 셀 스타일링
    muiTableHeadCellProps: {
      sx: { 
        fontSize: '0.875rem', 
        fontWeight: 600,
        backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f8fafc',
        color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
        borderBottom: `1px solid ${resolvedTheme === 'dark' ? '#4b5563' : '#e5e7eb'}`,
        '&:hover': {
          backgroundColor: resolvedTheme === 'dark' ? '#4b5563' : '#f1f5f9',
        }
      }
    },
    // 바디 셀 스타일링
    muiTableBodyCellProps: {
      sx: { 
        fontSize: '0.875rem',
        color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
        borderBottom: `1px solid ${resolvedTheme === 'dark' ? '#374151' : '#f1f5f9'}`,
        '&:focus-visible': {
          outline: `2px solid ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'}`,
          outlineOffset: '-2px',
        }
      }
    },
    // 바디 행 스타일링
    muiTableBodyRowProps: () => ({
      sx: {
        '&:nth-of-type(odd)': {
          backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
        },
        '&:nth-of-type(even)': {
          backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#f9fafb',
        },
        '&:hover': {
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f1f5f9',
        }
      }
    }),
    // 페이지네이션 스타일링
    muiPaginationProps: {
      sx: {
        position: 'relative',
        zIndex: 2,
        pointerEvents: 'auto',
        '& .MuiPaginationItem-root': {
          color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
          position: 'relative',
          zIndex: 3,
          pointerEvents: 'auto',
          cursor: 'pointer',
          '&.Mui-selected': {
            backgroundColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: resolvedTheme === 'dark' ? '#2563eb' : '#1d4ed8',
            }
          },
          '&:hover': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f1f5f9',
          }
        },
        '& .MuiPaginationItem-ellipsis': {
          color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
          position: 'relative',
          zIndex: 3,
          pointerEvents: 'auto',
        },
        '& .MuiSelect-select': {
          position: 'relative',
          zIndex: 4,
          pointerEvents: 'auto',
          cursor: 'pointer',
        },
        '& .MuiInputBase-input': {
          position: 'relative',
          zIndex: 4,
          pointerEvents: 'auto',
          cursor: 'pointer',
        }
      }
    },
    // 검색 필드 스타일링
    muiSearchTextFieldProps: {
      sx: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
          '& fieldset': {
            borderColor: resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db',
          },
          '&:hover fieldset': {
            borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
          },
          '&.Mui-focused fieldset': {
            borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
          }
        },
        '& .MuiInputLabel-root': {
          color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
        }
      }
    },
    // 필터 필드 스타일링
    muiFilterTextFieldProps: {
      sx: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
          '& fieldset': {
            borderColor: resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db',
          },
          '&:hover fieldset': {
            borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
          },
          '&.Mui-focused fieldset': {
            borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
          }
        },
        '& .MuiInputLabel-root': {
          color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
        }
      }
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
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
      fullScreen={isMobile}
      maxWidth={isTablet ? 'sm' : 'lg'}
      fullWidth
    >
      <DialogContent className={`${isMobile ? 'h-full' : 'max-h-[90vh] h-auto'} w-full overflow-hidden p-0 relative z-50`}>
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                <Filter className="h-5 w-5 sm:h-6 sm:w-6" />
                {tableSchema.displayName} 관리
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                총 {tableCount.toLocaleString()}개의 데이터 중 {filteredData.length.toLocaleString()}개 표시 중
              </DialogDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    고급 필터
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
              {advancedFilters.length > 0 && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="w-full sm:w-auto">
                  <FilterX className="h-4 w-4 mr-2" />
                  필터 초기화
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* 고급 필터 패널 */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleContent className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">필터 조건</h3>
                <Button size="sm" onClick={addFilter} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  조건 추가
                </Button>
              </div>
              
              {advancedFilters.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  필터 조건을 추가하여 원하는 데이터를 찾아보세요
                </p>
              ) : (
                <div className="space-y-3">
                  {advancedFilters.map((filter, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      {/* 컬럼 선택 */}
                      <Select
                        value={filter.column}
                        onValueChange={(value) => updateFilter(index, 'column', value)}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tableSchema?.columns.map((col) => (
                            <SelectItem key={col.key} value={col.key}>
                              {col.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* 연산자 선택 */}
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(index, 'operator', value)}
                      >
                        <SelectTrigger className="w-full sm:w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">같음</SelectItem>
                          <SelectItem value="contains">포함</SelectItem>
                          <SelectItem value="startsWith">시작</SelectItem>
                          <SelectItem value="endsWith">끝</SelectItem>
                          <SelectItem value="greaterThan">보다 큼</SelectItem>
                          <SelectItem value="lessThan">보다 작음</SelectItem>
                          <SelectItem value="between">범위</SelectItem>
                          <SelectItem value="isNull">비어있음</SelectItem>
                          <SelectItem value="isNotNull">비어있지 않음</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* 값 입력 */}
                      {filter.operator !== 'isNull' && filter.operator !== 'isNotNull' && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                          <Input
                            type={tableSchema?.columns.find(col => col.key === filter.column)?.type === 'number' ? 'number' : 'text'}
                            value={filter.value}
                            onChange={(e) => updateFilter(index, 'value', e.target.value)}
                            placeholder="값 입력"
                            className="w-full sm:w-40"
                          />
                          {filter.operator === 'between' && (
                            <>
                              <span className="text-gray-500 hidden sm:inline">~</span>
                              <Input
                                type={tableSchema?.columns.find(col => col.key === filter.column)?.type === 'number' ? 'number' : 'text'}
                                value={filter.value2 || ''}
                                onChange={(e) => updateFilter(index, 'value2', e.target.value)}
                                placeholder="최대값"
                                className="w-full sm:w-40"
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* 삭제 버튼 */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFilter(index)}
                        className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6 relative z-10">
          <MaterialReactTable table={table} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
