'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_Cell } from 'material-react-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
// import { applyMuiPaginationFixes } from '@/utils/mui-pagination-fix' // 현재 사용하지 않음

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
      { key: 'id', label: 'ID', type: 'number', editable: false, required: false },
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

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const { resolvedTheme } = useTheme()
  const [globalFilter, setGlobalFilter] = useState('')
  const [columnFilters, setColumnFilters] = useState<Array<{ id: string; value: unknown }>>([])
  const [showColumnFilters, setShowColumnFilters] = useState(false)
  const [showGlobalFilter, setShowGlobalFilter] = useState(true)

  const tableSchema = TABLE_SCHEMAS[tableName as keyof typeof TABLE_SCHEMAS]

  // MUI Pagination 클릭 문제 해결 - CSS로만 처리 (무한 루프 방지)
  useEffect(() => {
    if (!isOpen) return

    // CSS 스타일만으로 처리하므로 JavaScript 수정사항은 비활성화
    // const cleanup = applyMuiPaginationFixes()
    // return cleanup
  }, [isOpen])

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
      muiEditTextFieldProps: () => ({
        type: col.type === 'number' ? 'number' : col.type === 'password' ? 'password' : 'text',
        required: col.required || false,
        variant: 'outlined' as const,
        size: 'small' as const,
        label: col.required ? `${col.label} *` : col.label,
      }),
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
    getRowId: (originalRow) => String(originalRow.id ?? ''),
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
    
    // 모달 다이얼로그 props는 CSS로 처리
    
    
    
    
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
    // 모달 다이얼로그 props 설정은 CSS로 처리
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
    // 편집 관련 콜백
    onEditingRowSave: ({ values, table }) => {
      saveData(values as TableData)
      table.setEditingRow(null)
    },
    onEditingRowCancel: ({ table }) => {
      table.setEditingRow(null)
    },
    // 생성 관련 콜백
    onCreatingRowSave: ({ values, table }) => {
      createData(values)
      table.setCreatingRow(null)
    },
    onCreatingRowCancel: ({ table }) => {
      table.setCreatingRow(null)
    },
    
    
    // 편집 모달의 커스텀 렌더링 - 개선된 반응형 레이아웃
    renderEditRowDialogContent: ({ internalEditComponents }: { internalEditComponents: React.ReactNode[]; row: unknown; table: unknown }) => {
      return (
        <div className="space-y-6 p-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            편집할 필드를 수정하고 저장 버튼을 클릭하세요.
          </div>
          
          {/* 개선된 그리드 레이아웃 - 더 나은 반응형 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {internalEditComponents.map((component, index) => (
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
    renderCreateRowDialogContent: ({ internalEditComponents }: { internalEditComponents: React.ReactNode[]; row: unknown; table: unknown }) => {
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
            {internalEditComponents.map((component, index) => (
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

    renderRowActions: ({ row, table }) => (
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
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="flex gap-2">
        <Button 
          onClick={() => table.setCreatingRow(true)}
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
        // 페이지네이션 영역은 더 높은 z-index 허용
        '& .MuiTablePagination-root': {
          position: 'relative',
          zIndex: 9999,
          isolation: 'isolate',
        }
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

    // 페이지네이션 props 설정 - 데스크톱 클릭 문제 해결
    muiPaginationProps: {
      // Select 컴포넌트의 MenuProps 설정으로 드롭다운 문제 해결
      SelectProps: {
        MenuProps: {
          // 메뉴가 올바른 컨테이너에 렌더링되도록 설정
          container: typeof document !== 'undefined' ? document.body : undefined,
          // 포털 사용하여 z-index 문제 해결
          disablePortal: false,
          // aria-hidden 문제 해결을 위한 설정
          disableAutoFocusItem: true,
          autoFocus: false,
          // 접근성 개선
          keepMounted: false,
          // 무한 재귀 방지
          disableScrollLock: true,
          // 메뉴 스타일 설정
          PaperProps: {
            // aria-hidden 제거하여 접근성 개선
            sx: {
              backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
              border: `1px solid ${resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
              borderRadius: '6px',
              boxShadow: resolvedTheme === 'dark'
                ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)'
                : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              zIndex: 9999,
              maxHeight: '300px',
              // 드롭다운 메뉴 아이템 스타일 - 데스크톱에서도 모바일 크기로 통일
              '& .MuiMenuItem-root': {
                color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
                fontSize: '13px',
                padding: '4px 8px',
                minHeight: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  backgroundColor: resolvedTheme === 'dark' ? '#4b5563' : '#f3f4f6',
                },
                '&.Mui-selected': {
                  backgroundColor: resolvedTheme === 'dark' ? '#1e40af' : '#dbeafe',
                  '&:hover': {
                    backgroundColor: resolvedTheme === 'dark' ? '#1e3a8a' : '#bfdbfe',
                  },
                },
              },
            },
          },
        },
        // Select 자체 스타일 설정
        sx: {
          '&.MuiInputBase-root': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
            border: `1px solid ${resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '6px',
            minHeight: '32px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: resolvedTheme === 'dark' ? '#4b5563' : '#f9fafb',
              borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
            },
            '&.Mui-focused': {
              backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
              borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
              boxShadow: `0 0 0 1px ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'}`,
            },
            // 기본 MUI underline 제거
            '&::before, &::after': {
              display: 'none',
            },
          },
          // Select 내부 요소들
          '& .MuiSelect-select': {
            padding: '6px 32px 6px 12px',
            minHeight: 'auto',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            '&:focus': {
              backgroundColor: 'transparent',
            },
          },
          '& .MuiSelect-icon': {
            right: '8px',
            color: resolvedTheme === 'dark' ? '#9ca3af' : '#6b7280',
            cursor: 'pointer',
          },
        },
      },
      sx: {
        // 기본 스타일 초기화
        '& .MuiTablePagination-root': {
          position: 'relative',
          zIndex: 1,
        },
        // 페이지네이션 버튼들
        '& .MuiTablePagination-actions button': {
          color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#f3f4f6',
          },
          '&.Mui-disabled': {
            color: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
          },
        },
        // 텍스트 색상
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
          color: resolvedTheme === 'dark' ? '#f9fafb' : '#1f2937',
        },
      }
    },

    // 테이블 페이퍼에 포털 컨테이너 설정 - z-index 문제 해결
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: '12px',
        border: `1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
        backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate',
        // 필요한 상호작용 요소들만 클릭 가능하도록 설정
        '& button, & input, & select, & [role="button"], & [role="menuitem"]': {
          pointerEvents: 'auto !important',
        },
        // 페이지네이션 영역 특별 처리
        '& .MuiTablePagination-root': {
          position: 'relative',
          zIndex: 5,
          isolation: 'isolate',
          // Select 컴포넌트 강화
          '& .MuiTablePagination-select': {
            position: 'relative',
            zIndex: 10,
            isolation: 'isolate',
            cursor: 'pointer',
            '&.MuiInputBase-root': {
              cursor: 'pointer',
          // 데스크톱에서 더 명확한 스타일 - 버튼 크기에 맞춤
          '@media (min-width: 768px)': {
            border: `1px solid ${resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '6px',
            backgroundColor: resolvedTheme === 'dark' ? '#374151' : '#ffffff',
            width: '60px', // 버튼 크기에 맞춤
            minWidth: '60px',
            maxWidth: '60px',
            height: '32px',
            minHeight: '32px',
            maxHeight: '32px',
            '&:hover': {
              backgroundColor: resolvedTheme === 'dark' ? '#4b5563' : '#f9fafb',
              borderColor: resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af',
            },
            '&.Mui-focused': {
              borderColor: resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb',
              boxShadow: `0 0 0 1px ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'}`,
            },
          },
            },
            '& .MuiSelect-select': {
              cursor: 'pointer',
              userSelect: 'none',
              position: 'relative',
              zIndex: 11,
              // 데스크톱에서 패딩 조정
              '@media (min-width: 768px)': {
                padding: '4px 24px 4px 8px',
                height: '24px',
                minHeight: '24px',
                lineHeight: '24px',
              },
            },
            '& .MuiSelect-icon': {
              cursor: 'pointer',
              position: 'relative',
              zIndex: 11,
              // 데스크톱에서 아이콘 위치 조정
              '@media (min-width: 768px)': {
                right: '6px',
                top: '50%',
                transform: 'translateY(-50%)',
              },
            },
          },
        },
        // 툴바 버튼들
        '& .MuiIconButton-root, & .MuiButton-root, & .MuiButtonBase-root': {
          cursor: 'pointer !important',
          position: 'relative',
          zIndex: 10,
        },
        // 테이블 헤더 액션 버튼들
        '& .MuiTableHead-root .MuiIconButton-root': {
          cursor: 'pointer !important',
          position: 'relative',
          zIndex: 10,
        },
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

  // 모달 외부 클릭 시 닫히지 않도록 하는 핸들러 - 무한 재귀 방지
  const handleInteractOutside = useCallback((e: Event) => {
    // 이벤트 전파 중단
    e.stopPropagation()
    
    const target = e.target as HTMLElement
    
    // MUI 관련 요소들이나 모달 내부 요소 클릭 시 모달이 닫히지 않도록 방지
    const shouldPreventClose = target.closest('.MuiMenu-root, .MuiPopover-root, .MuiDialog-root, [data-testid="database-management-modal"]')
    
    if (shouldPreventClose) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  // 모달 열림/닫힘 시 MUI Select 클릭 문제 해결 - 무한 루프 방지
  useEffect(() => {
    if (!isOpen) return

    // 기존 스타일이 있으면 제거
    const existingStyle = document.getElementById('mui-select-fix')
    if (existingStyle) {
      existingStyle.remove()
    }

    // aria-hidden 문제 해결을 위한 전역 스타일 추가
    const style = document.createElement('style')
    style.id = 'mui-select-fix'
    style.textContent = `
        /* 관리 모달창 z-index 설정 (기본 모달) */
        .MuiDialog-root[data-testid="database-management-modal"] {
          z-index: 1300 !important;
        }
        
        .MuiDialog-root[data-testid="database-management-modal"] .MuiBackdrop-root {
          z-index: 1299 !important;
        }
        
        /* 새 데이터 추가 모달창 z-index 설정 (관리 모달 위에 표시) */
        .MuiDialog-root:not([data-testid="database-management-modal"]) {
          z-index: 1400 !important;
        }
        
        .MuiDialog-root:not([data-testid="database-management-modal"]) .MuiBackdrop-root {
          z-index: 1399 !important;
        }
        
        /* 새 데이터 추가 모달 스크롤 스타일 - 개선된 반응형 */
        .MuiDialog-root:not([data-testid="database-management-modal"]) .MuiDialog-paper {
          width: 95vw !important;
          max-width: 1400px !important;
          height: 85vh !important;
          max-height: 900px !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          border-radius: 12px !important;
          background-color: ${resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'} !important;
          z-index: 1400 !important;
          position: relative !important;
        }
        
        /* Material React Table 편집/생성 모달 크기 조정 - 반응형 (새 데이터 추가 모달만) */
        .MuiDialog-root:not([data-testid="database-management-modal"]) .MuiDialog-paper {
          width: 95vw !important;
          max-width: 1400px !important;
          height: 85vh !important;
          max-height: 900px !important;
          z-index: 1400 !important;
        }
        
        /* Material React Table 모달 컨테이너 - 반응형 (새 데이터 추가 모달만) */
        .MuiDialog-root:not([data-testid="database-management-modal"])[role="dialog"] .MuiDialog-paper {
          width: 95vw !important;
          max-width: 1400px !important;
          height: 85vh !important;
          max-height: 900px !important;
          z-index: 1400 !important;
        }
        
        /* 모바일 대응 - 새 데이터 추가 모달만 */
        @media (max-width: 768px) {
          .MuiDialog-root:not([data-testid="database-management-modal"]) .MuiDialog-paper,
          .MuiDialog-root:not([data-testid="database-management-modal"])[role="dialog"] .MuiDialog-paper {
            width: 98vw !important;
            max-width: none !important;
            height: 90vh !important;
            max-height: none !important;
            margin: 1vh !important;
          }
        }
        
        /* 큰 화면에서 새 데이터 추가 모달 크기 증가 */
        @media (min-width: 1920px) {
          .MuiDialog-root:not([data-testid="database-management-modal"]) .MuiDialog-paper,
          .MuiDialog-root:not([data-testid="database-management-modal"])[role="dialog"] .MuiDialog-paper {
            width: 90vw !important;
            max-width: 1600px !important;
            height: 80vh !important;
            max-height: 1000px !important;
          }
        }
        
        .MuiDialogContent-root {
          overflow: auto !important;
          padding: 24px !important;
          max-height: calc(85vh - 160px) !important;
          flex: 1 !important;
          /* 부드러운 스크롤 */
          scroll-behavior: smooth !important;
          /* 스크롤바 스타일링 */
          scrollbar-width: thin !important;
          scrollbar-color: ${resolvedTheme === 'dark' ? '#6b7280 #374151' : '#cbd5e1 #f1f5f9'} !important;
        }
        
        /* 모바일에서 컨텐츠 영역 조정 */
        @media (max-width: 768px) {
          .MuiDialogContent-root {
            padding: 16px !important;
            max-height: calc(90vh - 140px) !important;
          }
        }
        
        /* 큰 화면에서 컨텐츠 영역 조정 */
        @media (min-width: 1920px) {
          .MuiDialogContent-root {
            max-height: calc(80vh - 180px) !important;
            padding: 32px !important;
          }
        }
        
        .MuiDialogContent-root::-webkit-scrollbar {
          width: 8px !important;
        }
        
        .MuiDialogContent-root::-webkit-scrollbar-track {
          background: ${resolvedTheme === 'dark' ? '#374151' : '#f1f5f9'} !important;
          border-radius: 4px !important;
        }
        
        .MuiDialogContent-root::-webkit-scrollbar-thumb {
          background: ${resolvedTheme === 'dark' ? '#6b7280' : '#cbd5e1'} !important;
          border-radius: 4px !important;
        }
        
        .MuiDialogContent-root::-webkit-scrollbar-thumb:hover {
          background: ${resolvedTheme === 'dark' ? '#9ca3af' : '#94a3b8'} !important;
        }
        
        .MuiDialogActions-root {
          padding: 16px 20px !important;
          border-top: 1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'} !important;
          background-color: ${resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'} !important;
          flex-shrink: 0 !important;
          gap: 8px !important;
        }
        
        .MuiDialogTitle-root {
          padding: 20px 20px 0 20px !important;
          border-bottom: 1px solid ${resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'} !important;
          margin-bottom: 16px !important;
          flex-shrink: 0 !important;
        }
        
        /* 편집 모달 폼 필드 스타일링 */
        .MuiDialogContent-root .MuiFormControl-root,
        .MuiDialogContent-root .MuiTextField-root,
        .MuiDialogContent-root .MuiSelect-root {
          margin-bottom: 16px !important;
        }
        
        .MuiDialogContent-root .MuiOutlinedInput-root {
          background-color: ${resolvedTheme === 'dark' ? '#374151' : '#ffffff'} !important;
        }
        
        .MuiDialogContent-root .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline {
          border-color: ${resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af'} !important;
        }
        
        .MuiDialogContent-root .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
          border-color: ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'} !important;
        }
        
        .MuiDialogContent-root .MuiInputLabel-root {
          color: ${resolvedTheme === 'dark' ? '#d1d5db' : '#374151'} !important;
        }
        
        .MuiDialogContent-root .MuiInputLabel-root.Mui-focused {
          color: ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'} !important;
        }
        
        /* 편집 모달 그리드 레이아웃 - 개선된 반응형 */
        .MuiDialogContent-root .space-y-4,
        .MuiDialogContent-root .space-y-6 {
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
        }
        
        .MuiDialogContent-root .grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 24px !important;
        }
        
        /* 태블릿 */
        @media (min-width: 640px) {
          .MuiDialogContent-root .grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
        }
        
        /* 데스크톱 */
        @media (min-width: 1280px) {
          .MuiDialogContent-root .grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 24px !important;
          }
        }
        
        /* 큰 화면 */
        @media (min-width: 1536px) {
          .MuiDialogContent-root .grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 24px !important;
          }
        }
        
        /* 필드 라벨 스타일링 - 개선된 가독성 */
        .MuiDialogContent-root label {
          display: block !important;
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          color: ${resolvedTheme === 'dark' ? '#f3f4f6' : '#1f2937'} !important;
          margin-bottom: 6px !important;
          line-height: 1.4 !important;
        }
        
        /* 필수 필드 표시 개선 */
        .MuiDialogContent-root label:has-text('*') {
          color: ${resolvedTheme === 'dark' ? '#fbbf24' : '#d97706'} !important;
        }
        
        /* 필수 필드 표시 */
        .MuiDialogContent-root .text-red-500 {
          color: #ef4444 !important;
          margin-left: 4px !important;
        }
        
        /* 정보 박스 스타일링 */
        .MuiDialogContent-root .bg-blue-50 {
          background-color: ${resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff'} !important;
          border-color: ${resolvedTheme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#dbeafe'} !important;
        }
        
        .MuiDialogContent-root .bg-green-50 {
          background-color: ${resolvedTheme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4'} !important;
          border-color: ${resolvedTheme === 'dark' ? 'rgba(34, 197, 94, 0.3)' : '#dcfce7'} !important;
        }
        
        .MuiDialogContent-root .text-blue-700 {
          color: ${resolvedTheme === 'dark' ? '#93c5fd' : '#1d4ed8'} !important;
        }
        
        .MuiDialogContent-root .text-green-700 {
          color: ${resolvedTheme === 'dark' ? '#86efac' : '#15803d'} !important;
        }
        /* MUI Select 데스크톱 클릭 문제 해결 - 접근성 개선 */
        .MuiTablePagination-select.MuiInputBase-root {
          cursor: pointer !important;
          position: relative !important;
          z-index: 10 !important;
          isolation: isolate !important;
        }
        
        .MuiTablePagination-select .MuiSelect-select {
          cursor: pointer !important;
          user-select: none !important;
          position: relative !important;
          z-index: 11 !important;
          min-height: 32px !important;
          display: flex !important;
          align-items: center !important;
        }
        
        .MuiTablePagination-select .MuiSelect-icon {
          cursor: pointer !important;
          position: relative !important;
          z-index: 11 !important;
        }
        
        /* MUI 포털 컴포넌트들 - 접근성 개선 */
        .MuiMenu-root, .MuiPopover-root {
          z-index: 99999 !important;
          position: fixed !important;
          isolation: isolate !important;
          /* aria-hidden 문제 해결 */
          aria-hidden: false !important;
        }
        
        .MuiMenu-paper, .MuiPopover-paper {
          z-index: 99999 !important;
          position: relative !important;
          isolation: isolate !important;
          /* aria-hidden 문제 해결 */
          aria-hidden: false !important;
        }
        
        .MuiMenuItem-root {
          cursor: pointer !important;
          user-select: none !important;
          min-height: 28px !important;
          display: flex !important;
          align-items: center !important;
          font-size: 13px !important;
          padding: 4px 8px !important;
        }
        
        /* 필요한 MUI 버튼 요소들만 클릭 가능하게 */
        .MuiIconButton-root, .MuiButton-root, .MuiButtonBase-root {
          cursor: pointer !important;
          position: relative !important;
          z-index: 10 !important;
        }
        
        /* 입력 필드 포커스 및 상호작용 보장 */
        .MuiTextField-root, .MuiInputBase-root, .MuiOutlinedInput-root,
        .MuiSelect-root, .MuiFormControl-root {
          z-index: 1500 !important;
          position: relative !important;
        }
        
        .MuiTextField-root input, .MuiInputBase-input, .MuiOutlinedInput-input {
          z-index: 1501 !important;
          position: relative !important;
        }
        
        /* Select 드롭다운 z-index */
        .MuiSelect-select {
          z-index: 1501 !important;
        }
        
        .MuiMenu-root, .MuiPopover-root {
          z-index: 1500 !important;
        }
        
        .MuiMenu-paper, .MuiPopover-paper {
          z-index: 1500 !important;
        }
        
        /* 테이블 페이지네이션 전체 영역 */
        .MuiTablePagination-root {
          position: relative !important;
          z-index: 5 !important;
          isolation: isolate !important;
        }
        
        .MuiTablePagination-toolbar {
          position: relative !important;
          z-index: 5 !important;
        }
        
        /* 데스크톱 특화 스타일 - 버튼 크기에 맞춤 */
        @media (min-width: 768px) {
          .MuiTablePagination-select.MuiInputBase-root {
            border: 1px solid ${resolvedTheme === 'dark' ? '#4b5563' : '#d1d5db'} !important;
            border-radius: 6px !important;
            background-color: ${resolvedTheme === 'dark' ? '#374151' : '#ffffff'} !important;
            width: 60px !important;
            min-width: 60px !important;
            max-width: 60px !important;
            height: 32px !important;
            min-height: 32px !important;
            max-height: 32px !important;
          }
          
          .MuiTablePagination-select.MuiInputBase-root:hover {
            background-color: ${resolvedTheme === 'dark' ? '#4b5563' : '#f9fafb'} !important;
            border-color: ${resolvedTheme === 'dark' ? '#6b7280' : '#9ca3af'} !important;
          }
          
          /* 데스크톱에서 드롭다운 메뉴 아이템을 모바일 크기로 맞춤 */
          .MuiMenuItem-root {
            min-height: 28px !important;
            font-size: 13px !important;
            padding: 4px 8px !important;
          }
          
          .MuiMenuItem-root:hover {
            background-color: ${resolvedTheme === 'dark' ? '#4b5563' : '#f3f4f6'} !important;
          }
          
          .MuiTablePagination-select .MuiSelect-select {
            padding: 4px 24px 4px 8px !important;
            height: 24px !important;
            min-height: 24px !important;
            line-height: 24px !important;
          }
          
          .MuiTablePagination-select .MuiSelect-icon {
            right: 6px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
          }
        }
        
        /* 모바일 터치 최적화 */
        @media (max-width: 767px) {
          .MuiTablePagination-select.MuiInputBase-root,
          .MuiMenuItem-root,
          .MuiIconButton-root {
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          
          .MuiTablePagination-select .MuiSelect-select {
            min-height: 44px !important;
            padding: 10px 32px 10px 12px !important;
          }
          
          .MuiMenuItem-root {
            min-height: 44px !important;
            padding: 12px 16px !important;
          }
        }
        
        /* 포커스 상태 개선 */
        .MuiTablePagination-select.MuiInputBase-root.Mui-focused {
          border-color: ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'} !important;
          box-shadow: 0 0 0 1px ${resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'} !important;
        }
        
        /* underline 제거 */
        .MuiTablePagination-select.MuiInputBase-root::before,
        .MuiTablePagination-select.MuiInputBase-root::after {
          display: none !important;
        }
      `

    document.head.appendChild(style)

    return () => {
      const styleElement = document.getElementById('mui-select-fix')
      if (styleElement) {
        styleElement.remove()
      }
    }
  }, [isOpen, resolvedTheme])



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

  // 모달 닫기 핸들러 - 포커스 관리 개선
  const handleClose = useCallback((open: boolean) => {
    if (!open) {
      // 포커스를 모달을 열었던 버튼으로 돌려보내기
      const triggerButton = document.querySelector('[data-testid="database-management-modal-trigger"]') as HTMLElement
      if (triggerButton) {
        triggerButton.focus()
      }
      onClose()
    }
  }, [onClose])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
      data-testid="database-management-modal"
      // 접근성 개선: aria-hidden 제거
      aria-hidden={false}
    >
      <DialogContent
        size="full"
        className="w-[95vw] h-[90vh] max-w-none max-h-none p-0 relative z-50"
        onInteractOutside={handleInteractOutside}
        aria-describedby={undefined}
        // 접근성 개선: aria-hidden 제거하여 스크린 리더가 모달 내용에 접근할 수 있도록 함
        aria-hidden={false}
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
        <div
          className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 relative z-10 max-h-[calc(90vh-120px)] overflow-auto"
          style={{
            isolation: 'isolate',
            pointerEvents: 'auto'
          }}
        >
          <MaterialReactTable table={table} />
        </div>
      </DialogContent>
    </Dialog>
  )
}