import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FilterCondition {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'isNull' | 'isNotNull'
  value: string | number
  value2?: string | number // for 'between' operator
}

interface FilterState {
  // 테이블별 필터 상태
  tableFilters: Record<string, {
    advancedFilters: FilterCondition[]
    isFilterOpen: boolean
    globalFilter: string
    columnFilters: Array<{ id: string; value: unknown }>
  }>
  
  // 액션들
  setTableFilters: (tableName: string, filters: Partial<FilterState['tableFilters'][string]>) => void
  resetTableFilters: (tableName: string) => void
  resetAllFilters: () => void
  getTableFilters: (tableName: string) => FilterState['tableFilters'][string]
}

const defaultTableFilters = {
  advancedFilters: [],
  isFilterOpen: false,
  globalFilter: '',
  columnFilters: []
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      tableFilters: {},
      
      setTableFilters: (tableName, filters) => {
        set((state) => ({
          tableFilters: {
            ...state.tableFilters,
            [tableName]: {
              ...defaultTableFilters,
              ...state.tableFilters[tableName],
              ...filters
            }
          }
        }))
      },
      
      resetTableFilters: (tableName) => {
        set((state) => ({
          tableFilters: {
            ...state.tableFilters,
            [tableName]: { ...defaultTableFilters }
          }
        }))
      },
      
      resetAllFilters: () => {
        set({ tableFilters: {} })
      },
      
      getTableFilters: (tableName) => {
        const state = get()
        return state.tableFilters[tableName] || { ...defaultTableFilters }
      }
    }),
    {
      name: 'database-filter-storage',
      // 테이블별 필터만 저장하고, 다른 상태는 제외
      partialize: (state) => ({ tableFilters: state.tableFilters })
    }
  )
)
