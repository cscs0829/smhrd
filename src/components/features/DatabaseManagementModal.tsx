'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_Cell, type MRT_Row } from 'material-react-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Save, X, Search } from 'lucide-react'
import { useTheme } from 'next-themes'

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
  const [totalCount, setTotalCount] = useState<number>(tableCount || 0)
  const [editingRow, setEditingRow] = useState<string | number | null>(null)
  const [editingData, setEditingData] = useState<TableData>({ id: '' })
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const { resolvedTheme } = useTheme()
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<Array<{ id: string; value: unknown }>>([])
  const [showColumnFilters, setShowColumnFilters] = useState(false)
  const [showGlobalFilter, setShowGlobalFilter] = useState(true)

  const tableSchema = TABLE_SCHEMAS[tableName as keyof typeof TABLE_SCHEMAS]

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const searchParam = encodeURIComponent(globalFilter || '')
      const response = await fetch(`/api/admin/table-data?table=${tableName}&page=${pagination.pageIndex}&limit=${pagination.pageSize}&search=${searchParam}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setTotalCount(result.pagination?.total ?? totalCount)
      } else {
        toast.error('데이터를 불러오는데 실패했습니다')
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      toast.error('데이터를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [tableName, pagination.pageIndex, pagination.pageSize, totalCount, globalFilter])

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

  // 컬럼 정의 생성
  const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => {
    if (!tableSchema) return []

    const dataColumns: MRT_ColumnDef<TableData>[] = tableSchema.columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      size: col.key === 'id' ? 80 : 150,
      enableColumnFilter: true,
      enableSorting: true,
      // 컬럼별 필터 설정
      filterVariant: col.type === 'boolean' ? 'select' : 'text',
      filterSelectOptions: col.type === 'boolean' ? [
        { text: '예', value: 'true' },
        { text: '아니오', value: 'false' }
      ] : col.type === 'select' && 'options' in col && col.options ?
        col.options.map(option => ({ text: option.toUpperCase(), value: option })) : undefined,
      // 필터 텍스트 필드 커스터마이징
      muiFilterTextFieldProps: {
        placeholder: `${col.label} 검색...`,
        variant: 'outlined' as const,
        size: 'small' as const,
        sx: {
          minWidth: '120px',
          '& .MuiInputBase-root': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
          }
        }
      },
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
      }
    }))

    // 액션 컬럼 추가
    const actionsColumn: MRT_ColumnDef<TableData> = {
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
      }
    }

    return [...dataColumns, actionsColumn]
  }, [tableSchema, editingRow, editingData, saveData, deleteData, resolvedTheme])

  // 테이블 설정
  const table = useMaterialReactTable({
    columns,
    data: data,
    manualFiltering: false, // 클라이언트 사이드 필터링 활성화
    manualPagination: true,
    rowCount: totalCount,
    enablePagination: true,
    enableRowVirtualization: false,
    autoResetPageIndex: false,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableSorting: true,
    enableColumnFilterModes: true, // 필터 모드 활성화
    columnFilterDisplayMode: 'subheader', // 필터를 서브헤더에 표시
    getRowId: (originalRow) => String(originalRow.id ?? ''),
    enableRowActions: false,
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    // 한국어 로컬라이제이션
    localization: {
      language: 'ko',
      actions: '액션',
      and: '그리고',
      cancel: '취소',
      changeFilterMode: '필터 모드 변경',
      changeSearchMode: '검색 모드 변경',
      clearFilter: '필터 지우기',
      clearSearch: '검색 지우기',
      clearSort: '정렬 지우기',
      clickToCopy: '클릭하여 복사',
      collapse: '접기',
      collapseAll: '모두 접기',
      columnActions: '컬럼 액션',
      copiedToClipboard: '클립보드에 복사됨',
      dropToGroupBy: '그룹화하려면 여기에 드롭하세요: {column}',
      edit: '편집',
      expand: '펼치기',
      expandAll: '모두 펼치기',
      filterArrIncludes: '포함',
      filterArrIncludesAll: '모두 포함',
      filterArrIncludesSome: '일부 포함',
      filterBetween: '사이',
      filterBetweenInclusive: '사이 (포함)',
      filterByColumn: '{column}으로 필터링',
      filterContains: '포함',
      filterEmpty: '비어있음',
      filterEndsWith: '끝남',
      filterEquals: '같음',
      filterEqualsString: '같음',
      filterFuzzy: '퍼지',
      filterGreaterThan: '보다 큼',
      filterGreaterThanOrEqualTo: '보다 크거나 같음',
      filterInNumberRange: '숫자 범위 내',
      filterIncludesString: '문자열 포함',
      filterIncludesStringSensitive: '문자열 포함 (대소문자 구분)',
      filterLessThan: '보다 작음',
      filterLessThanOrEqualTo: '보다 작거나 같음',
      filterMode: '필터 모드: {filterType}',
      filterNotEmpty: '비어있지 않음',
      filterNotEquals: '같지 않음',
      filterStartsWith: '시작함',
      filterWeakEquals: '약한 같음',
      filteringByColumn: '{column}으로 필터링 중 - {filterType} - {filterValue}',
      goToFirstPage: '첫 페이지로',
      goToLastPage: '마지막 페이지로',
      goToNextPage: '다음 페이지로',
      goToPreviousPage: '이전 페이지로',
      grab: '잡기',
      groupByColumn: '{column}으로 그룹화',
      groupedBy: '그룹화됨: ',
      hideAll: '모두 숨기기',
      hideColumn: '{column} 숨기기',
      max: '최대',
      min: '최소',
      move: '이동',
      noRecordsToDisplay: '표시할 레코드가 없습니다',
      noResultsFound: '결과를 찾을 수 없습니다',
      of: '의',
      or: '또는',
      pinToLeft: '왼쪽에 고정',
      pinToRight: '오른쪽에 고정',
      resetColumnSize: '컬럼 크기 재설정',
      resetOrder: '순서 재설정',
      rowActions: '행 액션',
      rowNumber: '행 번호',
      rowNumbers: '행 번호',
      rowsPerPage: '페이지당 행 수',
      save: '저장',
      search: '검색',
      select: '선택',
      selectedCountOfRowCountRowsSelected: '{rowCount}개 중 {selectedCount}개 행 선택됨',
      showAll: '모두 보기',
      showAllColumns: '모든 컬럼 보기',
      showHideColumns: '컬럼 보기/숨기기',
      showHideFilters: '필터 보기/숨기기',
      showHideSearch: '검색 보기/숨기기',
      sortByColumnAsc: '{column} 오름차순 정렬',
      sortByColumnDesc: '{column} 내림차순 정렬',
      sortedByColumnAsc: '{column} 오름차순으로 정렬됨',
      sortedByColumnDesc: '{column} 내림차순으로 정렬됨',
      thenBy: ', 그 다음 ',
      toggleDensity: '밀도 토글',
      toggleFullScreen: '전체 화면 토글',
      toggleSelectAll: '모두 선택 토글',
      toggleSelectRow: '행 선택 토글',
      toggleVisibility: '가시성 토글',
      ungroupByColumn: '{column} 그룹화 해제',
      unpin: '고정 해제',
      unpinAll: '모든 고정 해제',
    },
    initialState: {
      showColumnFilters: showColumnFilters,
      showGlobalFilter: showGlobalFilter,
    },
    state: {
      globalFilter,
      columnFilters,
      pagination,
      isLoading: loading,
      showColumnFilters,
      showGlobalFilter,
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value || '')
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    },
    onColumnFiltersChange: (value) => {
      const newValue = typeof value === 'function' ? value(columnFilters) : value
      setColumnFilters(newValue || [])
    },
    onPaginationChange: setPagination,
    onShowColumnFiltersChange: setShowColumnFilters,
    onShowGlobalFilterChange: setShowGlobalFilter,
    renderTopToolbarCustomActions: () => (
      <div className="flex gap-2">
        <Button onClick={addNew} disabled={editingRow !== null}>
          <Plus className="h-4 w-4 mr-2" />
          새 데이터 추가
        </Button>
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
    mrtTheme: {
      baseBackgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
      draggingBorderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
      matchHighlightColor: resolvedTheme === 'dark' ? '#fbbf24' : '#fde047',
      menuBackgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f9fafb',
      pinnedRowBackgroundColor: resolvedTheme === 'dark' ? '#1e40af' : '#dbeafe',
      selectedRowBackgroundColor: resolvedTheme === 'dark' ? '#1e3a8a' : '#bfdbfe',
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: '60vh',
        overflow: 'auto',
        position: 'relative',
        zIndex: 1,
      }
    },
    // 컬럼 필터 모드 설정
    columnFilterModeOptions: ['contains', 'startsWith', 'endsWith', 'equals'],

    // 전역 필터 텍스트 필드 props
    muiSearchTextFieldProps: {
      placeholder: '전체 검색...',
      variant: 'outlined' as const,
      size: 'small' as const,
      sx: {
        '& .MuiInputBase-root': {
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
        }
      }
    },

    // 테이블 헤더 셀 props 설정
    muiTableHeadCellProps: {
      sx: {
        '& .MuiIconButton-root': {
          '&:hover': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f1f5f9',
          }
        }
      }
    },

    // 페이지네이션 props 설정 - 클릭 문제 해결
    muiPaginationProps: {
      sx: {
        position: 'relative',
        zIndex: 1000,
        pointerEvents: 'auto',
        '& .MuiTablePagination-toolbar': {
          position: 'relative',
          zIndex: 1001,
          pointerEvents: 'auto',
        },
        '& .MuiTablePagination-select': {
          position: 'relative',
          zIndex: 1002,
          pointerEvents: 'auto !important',
          cursor: 'pointer !important',
          '&:focus': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          }
        },
        '& .MuiTablePagination-selectLabel': {
          position: 'relative',
          zIndex: 1001,
          pointerEvents: 'auto',
        },
        '& .MuiTablePagination-displayedRows': {
          position: 'relative',
          zIndex: 1001,
          pointerEvents: 'auto',
        },
        '& .MuiTablePagination-actions': {
          position: 'relative',
          zIndex: 1001,
          pointerEvents: 'auto',
          '& button': {
            pointerEvents: 'auto !important',
            cursor: 'pointer !important',
          }
        },
        '& .MuiInputBase-root': {
          position: 'relative',
          zIndex: 1003,
          pointerEvents: 'auto !important',
          cursor: 'pointer !important',
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          '&:hover': {
            backgroundColor: resolvedTheme === 'dark' ? '#4b5563' : '#f9fafb',
          },
          '&.Mui-focused': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          }
        },
        '& .MuiSelect-select': {
          position: 'relative',
          zIndex: 1004,
          pointerEvents: 'auto !important',
          cursor: 'pointer !important',
        },
        '& .MuiSelect-icon': {
          position: 'relative',
          zIndex: 1004,
          pointerEvents: 'auto !important',
          cursor: 'pointer !important',
        }
      }
    },

    // 테이블 페이퍼에 포털 컨테이너 설정
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '12px',
        border: `1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
        backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
        position: 'relative',
        zIndex: 1,
        '& .MuiPopover-root': {
          zIndex: 2000,
        },
        '& .MuiMenu-root': {
          zIndex: 2000,
        }
      }
    },



    // 필터 버튼 커스터마이징 - 토글 기능 강화
    renderToolbarInternalActions: ({ table }) => (
      <div className="flex items-center gap-1">
        {/* 컬럼 필터 토글 버튼 */}
        <button
          onClick={() => {
            const newValue = !showColumnFilters
            setShowColumnFilters(newValue)
            table.setShowColumnFilters(newValue)
          }}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${showColumnFilters ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
          title="컬럼 필터 토글"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10.83 8H21V6H8.83zm5 5H18v-2h-4.17zM14 16.83V18h-4v-2h3.17l-3-3H6v-2h2.17l-3-3H3V6h.17L1.39 4.22 2.8 2.81l18.38 18.38-1.41 1.41z" />
          </svg>
        </button>

        {/* 글로벌 필터 토글 버튼 */}
        <button
          onClick={() => {
            const newValue = !showGlobalFilter
            setShowGlobalFilter(newValue)
            table.setShowGlobalFilter(newValue)
          }}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${showGlobalFilter ? 'bg-blue-100 dark:bg-blue-900' : ''
            }`}
          title="검색 필터 토글"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    )
  })

  // 모달이 열릴 때 데이터 로드
  useEffect(() => {
    if (!isOpen || !tableName) return
    setTotalCount(tableCount || 0)
    setPagination({ pageIndex: 0, pageSize: 20 })
  }, [isOpen, tableName, tableCount])

  // 페이지네이션, 검색, 필터 변경 시 데이터 로드
  useEffect(() => {
    if (!isOpen || !tableName) return
    loadData()
  }, [isOpen, tableName, pagination.pageIndex, pagination.pageSize, globalFilter, loadData])

  // 모달 열림/닫힘 시 포커스 관리
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 aria-hidden 문제 방지
      const handleFocusCapture = (e: FocusEvent) => {
        const target = e.target as HTMLElement
        if (target.closest('[aria-hidden="true"]')) {
          e.stopPropagation()
        }
      }
      
      document.addEventListener('focusin', handleFocusCapture, true)
      
      return () => {
        document.removeEventListener('focusin', handleFocusCapture, true)
      }
    }
  }, [isOpen])



  if (!tableSchema) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent size="default" className="w-full max-w-2xl">
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
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent 
        size="full" 
        className="w-full p-0 relative z-50"
        onInteractOutside={(e) => {
          // 페이지네이션 셀렉트 박스 클릭 시 모달이 닫히지 않도록 방지
          const target = e.target as HTMLElement
          if (target.closest('.MuiSelect-root') || 
              target.closest('.MuiMenu-root') || 
              target.closest('.MuiPopover-root') ||
              target.closest('[role="listbox"]') ||
              target.closest('[role="option"]')) {
            e.preventDefault()
          }
        }}
        aria-describedby={undefined}
      >
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-semibold">
                {tableSchema.displayName} 관리
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                총 {totalCount.toLocaleString()}개의 데이터 표시 중
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* 테이블 컨테이너 */}
        <div className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 relative z-10 max-h-[70vh] overflow-auto">
          <MaterialReactTable table={table} />
        </div>
      </DialogContent>
    </Dialog>
  )
}