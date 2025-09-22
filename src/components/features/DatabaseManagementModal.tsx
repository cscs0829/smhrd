'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Sheet } from 'react-modal-sheet'
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Cell,
} from 'material-react-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Search, 
  Database,
  AlertCircle
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import NewDataModal from './NewDataModal'

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
      { key: 'id', label: 'ID', type: 'text', editable: false, required: false },
      { key: 'title', label: '제목', type: 'text', editable: true, required: true },
      { key: 'price_pc', label: 'PC 가격', type: 'number', editable: true, required: false },
      { key: 'benefit_price', label: '혜택 가격', type: 'number', editable: true, required: false },
      { key: 'normal_price', label: '정가', type: 'number', editable: true, required: false },
      { key: 'link', label: '링크', type: 'url', editable: true, required: false },
      { key: 'mobile_link', label: '모바일 링크', type: 'url', editable: true, required: false },
      { key: 'image_link', label: '이미지 링크', type: 'url', editable: true, required: false },
      { key: 'add_image_link', label: '추가 이미지 링크', type: 'url', editable: true, required: false },
      { key: 'video_url', label: '비디오 URL', type: 'url', editable: true, required: false },
      { key: 'category_name1', label: '카테고리1', type: 'text', editable: true, required: false },
      { key: 'category_name2', label: '카테고리2', type: 'text', editable: true, required: false },
      { key: 'category_name3', label: '카테고리3', type: 'text', editable: true, required: false },
      { key: 'category_name4', label: '카테고리4', type: 'text', editable: true, required: false },
      { key: 'brand', label: '브랜드', type: 'text', editable: true, required: false },
      { key: 'maker', label: '제조사', type: 'text', editable: true, required: false },
      { key: 'origin', label: '원산지', type: 'text', editable: true, required: false },
      { key: 'age_group', label: '연령대', type: 'text', editable: true, required: false },
      { key: 'gender', label: '성별', type: 'text', editable: true, required: false },
      { key: 'city', label: '도시', type: 'text', editable: true, required: false },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false, required: false },
      { key: 'updated_at', label: '수정일', type: 'datetime', editable: false, required: false }
    ]
  },
  city_images: {
    displayName: '도시 이미지',
    columns: [
      { key: 'id', label: 'ID', type: 'number', editable: false, required: false },
      { key: 'city', label: '도시', type: 'text', editable: true, required: true },
      { key: 'image_link', label: '이미지 링크', type: 'url', editable: true, required: true },
      { key: 'is_main_image', label: '메인 이미지', type: 'boolean', editable: true, required: false },
      { key: 'video_url', label: '비디오 URL', type: 'url', editable: true, required: false },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false, required: false }
    ]
  },
  titles: {
    displayName: '제목',
    columns: [
      { key: 'id', label: 'ID', type: 'text', editable: false, required: false },
      { key: 'title', label: '제목', type: 'text', editable: true, required: true },
      { key: 'city', label: '도시', type: 'text', editable: true, required: true },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false, required: false }
    ]
  },
  api_keys: {
    displayName: 'API 키',
    columns: [
      { key: 'id', label: 'ID', type: 'number', editable: false, required: false },
      { key: 'provider', label: '제공업체', type: 'select', editable: true, required: true, options: ['openai', 'anthropic', 'google'] },
      { key: 'name', label: '이름', type: 'text', editable: true, required: true },
      { key: 'is_active', label: '활성 상태', type: 'boolean', editable: true, required: false },
      { key: 'created_at', label: '생성일', type: 'datetime', editable: false, required: false }
    ]
  },
  deleted_items: {
    displayName: '삭제된 항목',
    columns: [
      { key: 'id', label: 'ID', type: 'text', editable: false, required: false },
      { key: 'original_data', label: '원본 데이터', type: 'json', editable: false, required: false },
      { key: 'deleted_at', label: '삭제일', type: 'datetime', editable: false, required: false },
      { key: 'reason', label: '삭제 사유', type: 'text', editable: true, required: false }
    ]
  }
}

export function DatabaseManagementModal({ isOpen, onClose, tableName, tableCount }: DatabaseManagementModalProps) {
  const [data, setData] = useState<TableData[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState<number>(tableCount || 0)
  const [showNewDataModal, setShowNewDataModal] = useState(false)

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
        setTotalCount(result.pagination?.total ?? 0)
      } else {
        toast.error('데이터를 불러오는데 실패했습니다')
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error)
      toast.error('데이터를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [tableName, pagination.pageIndex, pagination.pageSize, globalFilter])

  // 데이터 저장 (편집)
  const saveData = useCallback(async (rowData: TableData) => {
    try {
      const response = await fetch(`/api/admin/table-data?table=${tableName}&id=${rowData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('데이터가 수정되었습니다')
        loadData()
      } else {
        toast.error(result.error || '저장에 실패했습니다')
      }
    } catch (error) {
      console.error('데이터 저장 오류:', error)
      toast.error('저장 중 오류가 발생했습니다')
    }
  }, [tableName, loadData])

  // 새 데이터 생성
  const createData = useCallback(async (values: Record<string, unknown>) => {
    try {
      // ID 필드 제거 (자동 생성)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...newData } = values

      // 필수 필드 검증
      const requiredFields = tableSchema?.columns
        .filter(col => col.required && col.editable && col.key !== 'id' && !col.key.includes('_at'))
        .filter(col => {
          const value = newData[col.key]
          return value === undefined || value === null || value === ''
        })

      if (requiredFields && requiredFields.length > 0) {
        const missingFields = requiredFields.map(field => field.label).join(', ')
        toast.error(`다음 필수 필드를 입력해주세요: ${missingFields}`)
        return
      }

      // 로딩 상태 표시
      toast.loading('새 데이터를 저장하는 중...', { id: 'create-data' })

      const response = await fetch(`/api/admin/table-data?table=${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`${tableSchema?.displayName || '데이터'}가 성공적으로 추가되었습니다`, { id: 'create-data' })
        loadData()
      } else {
        toast.error(result.error || '데이터 추가에 실패했습니다', { id: 'create-data' })
      }
    } catch (error) {
      console.error('데이터 생성 오류:', error)
      toast.error('데이터 추가 중 오류가 발생했습니다', { id: 'create-data' })
    }
  }, [tableName, loadData, tableSchema])

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

  // 컬럼 정의 생성
  const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => {
    if (!tableSchema) return []

    const dataColumns: MRT_ColumnDef<TableData>[] = tableSchema.columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      size: col.key === 'id' ? 80 : 150,
      enableColumnFilter: true,
      enableSorting: true,
      enableEditing: col.editable,
      // 컬럼별 필터 설정
      filterVariant: col.type === 'boolean' ? 'select' : 'text',
      filterSelectOptions: col.type === 'boolean' ? [
        { text: '예', value: 'true' },
        { text: '아니오', value: 'false' }
      ] : col.type === 'select' && 'options' in col && col.options ?
        col.options.map(option => ({ text: option.toUpperCase(), value: option })) : undefined,
      // 편집 컴포넌트 커스터마이징
      muiEditTextFieldProps: ({ cell }) => {
        // id 필드는 항상 텍스트로 처리
        const inputType = col.key === 'id' ? 'text' : (col.type === 'number' ? 'number' : col.type === 'password' ? 'password' : 'text')
        
        const baseProps = {
          type: inputType,
          required: col.required || false,
          variant: 'outlined' as const,
          size: 'small' as const,
          label: col.required ? `${col.label} *` : col.label,
        }

        // number 타입 필드이면서 id가 아닌 경우에만 validation 추가
        if (col.type === 'number' && col.key !== 'id') {
          return {
            ...baseProps,
            onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
              const value = event.target.value
              // 유효하지 않은 값인 경우 이전 값으로 복원
              if (value !== '' && isNaN(Number(value))) {
                event.target.value = String(cell.getValue() || '')
              }
            },
            error: false, // validation error 상태 관리
            helperText: undefined, // helper text 제거
          }
        }

        return baseProps
      },
      // boolean과 select 타입을 위한 커스텀 편집 컴포넌트
      Edit: col.type === 'boolean' ? ({ cell, column, row, table }) => (
        <Select
          value={cell.getValue() ? 'true' : 'false'}
          onValueChange={(value) => {
            row._valuesCache[column.id] = value === 'true'
            if (table.getState().creatingRow) {
              table.setCreatingRow(row)
            } else if (table.getState().editingRow) {
              table.setEditingRow(row)
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">예</SelectItem>
            <SelectItem value="false">아니오</SelectItem>
          </SelectContent>
        </Select>
      ) : col.type === 'select' && 'options' in col && col.options ? ({ cell, column, row, table }) => (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {col.required ? `${col.label} *` : col.label}
          </label>
          <Select
            value={String(cell.getValue() || '')}
            onValueChange={(value) => {
              row._valuesCache[column.id] = value
              if (table.getState().creatingRow) {
                table.setCreatingRow(row)
              } else if (table.getState().editingRow) {
                table.setEditingRow(row)
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={col.required ? `${col.label}를 선택하세요 *` : `${col.label}를 선택하세요`} />
            </SelectTrigger>
            <SelectContent>
              {col.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : undefined,
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
      Cell: ({ cell }: { cell: MRT_Cell<TableData> }) => {
        const value = cell.getValue()

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
    }))

    return dataColumns
  }, [tableSchema, resolvedTheme])

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
    getRowId: (originalRow: TableData) => String(originalRow.id ?? ''),
    enableRowActions: true,
    positionActionsColumn: 'last',
    enableTopToolbar: true,
    enableBottomToolbar: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    // 편집 및 생성 기능 활성화
    enableEditing: true,
    editDisplayMode: 'modal',
    createDisplayMode: 'modal',
    positionCreatingRow: 'top',
    
    // 편집 모달 z-index 설정
    muiEditRowDialogProps: {
      sx: {
        zIndex: 10000, // 관리 모달보다 높은 z-index
      },
    } as never,
    muiCreateRowModalProps: {
      sx: {
        zIndex: 10000, // 관리 모달보다 높은 z-index
      },
    } as never,
    
    // 편집 텍스트 필드 스타일링
    muiEditTextFieldProps: {
      variant: 'outlined',
      size: 'small',
      fullWidth: true,
      sx: {
        '& .MuiOutlinedInput-root': {
          fontSize: '0.875rem',
          backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
          }
        },
        '& .MuiInputLabel-root': {
          color: resolvedTheme === 'dark' ? '#d1d5db' : '#374151',
          '&.Mui-focused': {
            color: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
          }
        }
      }
    },
    // 포털 컨테이너 설정으로 z-index 문제 해결
    muiTableBodyProps: {
      sx: {
        '& .MuiTableCell-root': {
          position: 'relative',
          zIndex: 1,
        },
      },
    },
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
    onGlobalFilterChange: (value: string) => {
      setGlobalFilter(value || '')
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    },
    onColumnFiltersChange: (value: unknown) => {
      const newValue = typeof value === 'function' ? value(columnFilters) : value
      setColumnFilters(newValue || [])
    },
    onPaginationChange: setPagination,
    onShowColumnFiltersChange: setShowColumnFilters,
    onShowGlobalFilterChange: setShowGlobalFilter,
    // 편집 관련 콜백
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEditingRowSave: ({ values, table }: { values: any; table: any }) => {
      saveData(values as TableData)
      table.setEditingRow(null)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onEditingRowCancel: ({ table }: { table: any }) => {
      table.setEditingRow(null)
    },
    // 생성 관련 콜백
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onCreatingRowSave: ({ values, table }: { values: any; table: any }) => {
      createData(values)
      table.setCreatingRow(null)
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onCreatingRowCancel: ({ table }: { table: any }) => {
      table.setCreatingRow(null)
    },
    
    // 편집 모달의 커스텀 렌더링 - 개선된 반응형 레이아웃
    renderEditRowDialogContent: ({ internalEditComponents }: { internalEditComponents: React.ReactNode[] }) => {
      return (
        <div className="space-y-6 p-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            편집할 필드를 수정하고 저장 버튼을 클릭하세요.
          </div>
          
          {/* 개선된 그리드 레이아웃 - 더 나은 반응형 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {internalEditComponents.map((component: React.ReactNode, index: number) => (
              <div key={index} className="min-h-[60px] flex flex-col">
                {component}
              </div>
            ))}
          </div>
          
          {/* 간소화된 정보 표시 */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">편집 팁</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• 필수 필드(*)는 반드시 입력해야 합니다</li>
                  <li>• URL 필드는 유효한 링크 형식으로 입력하세요</li>
                  <li>• 숫자 필드는 숫자만 입력 가능합니다</li>
                  <li>• 변경사항은 저장 버튼을 눌러야 반영됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    // 생성 모달의 커스텀 렌더링 - 개선된 UI
    renderCreateRowDialogContent: ({ internalEditComponents }: { internalEditComponents: React.ReactNode[] }) => {
      return (
        <div className="space-y-6 p-2">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              새로운 {tableSchema?.displayName || '데이터'} 추가
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              아래 폼을 작성하여 새로운 데이터를 추가하세요
            </p>
          </div>
          
          {/* 개선된 그리드 레이아웃 - 더 직관적인 배치 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {internalEditComponents.map((component: React.ReactNode, index: number) => (
              <div key={index} className="min-h-[70px] flex flex-col space-y-1">
                {component}
              </div>
            ))}
          </div>
          
          {/* 간소화된 정보 표시 */}
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                <p className="font-medium">생성 팁</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• 필수 필드(*)는 반드시 입력해야 합니다</li>
                  <li>• ID와 생성/수정일은 자동으로 설정됩니다</li>
                  <li>• URL 필드는 유효한 링크 형식으로 입력하세요</li>
                  <li>• 숫자 필드는 숫자만 입력 가능합니다</li>
                  <li>• 데이터는 생성 버튼을 눌러야 실제 DB에 저장됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderRowActions: ({ row, table }: { row: any; table: any }) => (
      <div className="flex gap-1">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => table.setEditingRow(row)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => deleteData(row.original.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    renderTopToolbarCustomActions: () => (
      <div className="flex gap-2">
        <Button 
          onClick={() => setShowNewDataModal(true)}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
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

  if (!tableSchema) {
    return (
      <Sheet isOpen={isOpen} onClose={onClose}>
        <Sheet.Container
          style={{
            backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Sheet.Header>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  알 수 없는 테이블
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Sheet.Header>
          <Sheet.Content>
            <div className="p-4">
              <p className="text-gray-600 dark:text-gray-400">
              선택한 테이블을 찾을 수 없습니다.
              </p>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>
    )
  }

  return (
    <>
      <Sheet isOpen={isOpen} onClose={onClose}>
        <Sheet.Container
          style={{
            backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Sheet.Header>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {tableSchema.displayName} 관리
                </h2>
                <Badge variant="secondary" className="ml-2">
                  {totalCount.toLocaleString()}개
                </Badge>
            </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
          </div>
          </Sheet.Header>

          <Sheet.Content>
            <div className="p-4 max-h-[80vh] overflow-y-auto">
          <MaterialReactTable table={table} />
        </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop />
      </Sheet>

      {/* 새 데이터 추가 모달 */}
      <NewDataModal
        isOpen={showNewDataModal}
        onClose={() => setShowNewDataModal(false)}
        tableName={tableName}
        onSave={createData}
        schema={tableSchema.columns.map(col => ({
          column_name: col.key,
          data_type: col.type === 'number' ? 'integer' : col.type === 'boolean' ? 'boolean' : 'text',
          is_nullable: col.required ? 'NO' : 'YES',
          column_default: null
        }))}
      />
    </>
  )
}