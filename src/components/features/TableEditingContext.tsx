"use client"

import React from 'react'

export interface TableEditingState {
  editingRowId: string | number | null
  setEditingRowId: (id: string | number | null) => void
  editingValues: Record<string, unknown>
  setEditingValues: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
}

export const TableEditingContext = React.createContext<TableEditingState | null>(null)

export function useTableEditing(): TableEditingState {
  const ctx = React.useContext(TableEditingContext)
  if (!ctx) {
    throw new Error('useTableEditing must be used within TableEditingContext.Provider')
  }
  return ctx
}


