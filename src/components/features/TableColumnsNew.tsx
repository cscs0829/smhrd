'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MoreHorizontal, Edit, Trash2, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useState } from 'react'
import { useTableEditing } from './TableEditingContext'

import { EpData, DeletedItem, ApiKey } from '@/types/database'
import { Row } from '@tanstack/react-table'

// EP 데이터 액션 컴포넌트
function EpDataActions({ row }: { row: Row<EpData> }) {
  const { editingRowId, setEditingRowId, editingValues, setEditingValues } = useTableEditing()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleEdit = () => {
    setEditingRowId(row.getValue('id') as string)
    setEditingValues({
      id: row.getValue('id') as string,
      title: row.getValue('title') as string,
      created_at: row.getValue('created_at') as string,
      updated_at: row.getValue('updated_at') as string,
    })
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/update-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'ep_data', id: editingValues.id, values: editingValues }),
      })
      if (!res.ok) throw new Error('업데이트 실패')
      toast.success('데이터가 성공적으로 수정되었습니다.')
      setEditingRowId(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('데이터 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  const handleCancelEdit = () => {
    setEditingRowId(null)
    setEditingValues({})
  }

  const handleDelete = async () => {
    try {
      const id = String(row.getValue('id'))
      const res = await fetch('/api/admin/delete-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'ep_data', ids: [id] }),
      })
      if (!res.ok) throw new Error('삭제 실패')
      toast.success('데이터가 성공적으로 삭제되었습니다.')
      setIsDeleteOpen(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('데이터 삭제 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  if (editingRowId === (row.getValue('id') as string)) {
    return (
      <div className="flex items-center space-x-2">
        <Button size="sm" onClick={handleSaveEdit}>저장</Button>
        <Button size="sm" variant="outline" onClick={handleCancelEdit}>취소</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('title'))}>
            <Copy className="mr-2 h-4 w-4" />
            제목 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 삭제 AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이 데이터를 영구적으로 삭제하시겠습니까?
              <br />
              <strong>제목: {row.getValue('title')}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ---------- 공통 인라인 편집 셀 컴포넌트들 ----------
function EpIdCell({ row }: { row: Row<EpData> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as string)
  if (!isEditing) return <div className="font-mono text-xs">{row.getValue('id')}</div>
  return (
    <Input
      value={(editingValues.id as string) ?? ''}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, id: e.target.value }))}
      className="h-8"
    />
  )
}

function EpTitleCell({ row }: { row: Row<EpData> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as string)
  if (!isEditing) return <div className="max-w-[200px] truncate">{row.getValue('title')}</div>
  return (
    <Input
      value={(editingValues.title as string) ?? ''}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, title: e.target.value }))}
      className="h-8"
      placeholder="제목"
    />
  )
}

function EpCreatedAtCell({ row }: { row: Row<EpData> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as string)
  if (!isEditing) return format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm')
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  return (
    <input
      type="datetime-local"
      value={toLocal(editingValues.created_at as string)}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, created_at: new Date(e.target.value).toISOString() }))}
      className="h-8 rounded border px-2 text-sm"
    />
  )
}

function EpUpdatedAtCell({ row }: { row: Row<EpData> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as string)
  if (!isEditing) return format(new Date(row.getValue('updated_at')), 'yyyy-MM-dd HH:mm')
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  return (
    <input
      type="datetime-local"
      value={toLocal(editingValues.updated_at as string)}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, updated_at: new Date(e.target.value).toISOString() }))}
      className="h-8 rounded border px-2 text-sm"
    />
  )
}

function DeletedIdCell({ row }: { row: Row<DeletedItem> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return <div className="font-mono text-xs">{row.getValue('id')}</div>
  return (
    <Input
      value={String(editingValues.id ?? '')}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, id: e.target.value }))}
      className="h-8"
    />
  )
}

function DeletedTitleCell({ row }: { row: Row<DeletedItem> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return <div className="max-w-[200px] truncate">{row.getValue('title')}</div>
  return (
    <Input
      value={(editingValues.title as string) ?? ''}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, title: e.target.value }))}
      className="h-8"
    />
  )
}

function DeletedCreatedAtCell({ row }: { row: Row<DeletedItem> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm')
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  return (
    <input
      type="datetime-local"
      value={toLocal(editingValues.created_at as string)}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, created_at: new Date(e.target.value).toISOString() }))}
      className="h-8 rounded border px-2 text-sm"
    />
  )
}

function DeletedUpdatedAtCell({ row }: { row: Row<DeletedItem> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return format(new Date(row.getValue('updated_at')), 'yyyy-MM-dd HH:mm')
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  return (
    <input
      type="datetime-local"
      value={toLocal(editingValues.updated_at as string)}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, updated_at: new Date(e.target.value).toISOString() }))}
      className="h-8 rounded border px-2 text-sm"
    />
  )
}

function ApiProviderCell({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) {
    return (
      <Badge variant={row.getValue('provider') === 'openai' ? 'default' : 'secondary'}>
        {row.getValue('provider')}
      </Badge>
    )
  }
  return (
    <Input
      value={(editingValues.provider as string) ?? String(row.getValue('provider') || '')}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, provider: e.target.value }))}
      className="h-8"
      placeholder="provider"
    />
  )
}

function ApiNameCell({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return <div className="font-medium">{row.getValue('name')}</div>
  return (
    <Input
      value={(editingValues.name as string) ?? ''}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, name: e.target.value }))}
      className="h-8"
      placeholder="이름"
    />
  )
}

function ApiIsActiveCell({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) {
    return (
      <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
        {row.getValue('is_active') ? '활성' : '비활성'}
      </Badge>
    )
  }
  return (
    <input
      type="checkbox"
      checked={Boolean(editingValues.is_active ?? row.getValue('is_active'))}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, is_active: e.target.checked }))}
    />
  )
}

function ApiIsDefaultCell({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) {
    return (
      <Badge variant={row.getValue('is_default') ? 'default' : 'secondary'}>
        {row.getValue('is_default') ? '기본' : '일반'}
      </Badge>
    )
  }
  return (
    <input
      type="checkbox"
      checked={Boolean(editingValues.is_default ?? row.getValue('is_default'))}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, is_default: e.target.checked }))}
    />
  )
}

function ApiCreatedAtCell({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm')
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  return (
    <input
      type="datetime-local"
      value={toLocal(editingValues.created_at as string)}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, created_at: new Date(e.target.value).toISOString() }))}
      className="h-8 rounded border px-2 text-sm"
    />
  )
}

function ApiUpdatedAtCell({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, editingValues, setEditingValues } = useTableEditing()
  const isEditing = editingRowId === (row.getValue('id') as number)
  if (!isEditing) return format(new Date(row.getValue('updated_at')), 'yyyy-MM-dd HH:mm')
  const toLocal = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }
  return (
    <input
      type="datetime-local"
      value={toLocal(editingValues.updated_at as string)}
      onChange={(e) => setEditingValues((prev) => ({ ...prev, updated_at: new Date(e.target.value).toISOString() }))}
      className="h-8 rounded border px-2 text-sm"
    />
  )
}

// 삭제된 아이템 액션 컴포넌트
function DeletedItemActions({ row }: { row: Row<DeletedItem> }) {
  const { editingRowId, setEditingRowId, editingValues, setEditingValues } = useTableEditing()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleEdit = () => {
    setEditingRowId(row.getValue('id') as number)
    setEditingValues({
      id: row.getValue('id') as number,
      title: (row.getValue('title') as string) || '',
      created_at: row.getValue('created_at') as string,
      updated_at: row.getValue('updated_at') as string,
    })
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/update-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'delect', id: editingValues.id, values: editingValues }),
      })
      if (!res.ok) throw new Error('업데이트 실패')
      toast.success('데이터가 성공적으로 수정되었습니다.')
      setEditingRowId(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('데이터 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  const handleCancelEdit = () => {
    setEditingRowId(null)
    setEditingValues({})
  }

  const handleDelete = async () => {
    try {
      const id = String(row.getValue('id'))
      const res = await fetch('/api/admin/delete-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'delect', ids: [id] }),
      })
      if (!res.ok) throw new Error('삭제 실패')
      toast.success('데이터가 성공적으로 삭제되었습니다.')
      setIsDeleteOpen(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('데이터 삭제 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  if (editingRowId === (row.getValue('id') as number)) {
    return (
      <div className="flex items-center space-x-2">
        <Button size="sm" onClick={handleSaveEdit}>저장</Button>
        <Button size="sm" variant="outline" onClick={handleCancelEdit}>취소</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(row.getValue('title') || ''))}>
            <Copy className="mr-2 h-4 w-4" />
            제목 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            영구 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 삭제 AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 영구 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이 데이터를 영구적으로 삭제하시겠습니까?
              <br />
              <strong>제목: {String(row.getValue('title') || '')}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              영구 삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// API 키 액션 컴포넌트
function ApiKeyActions({ row }: { row: Row<ApiKey> }) {
  const { editingRowId, setEditingRowId, editingValues, setEditingValues } = useTableEditing()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const handleEdit = () => {
    setEditingRowId(row.getValue('id') as number)
    setEditingValues({
      id: row.getValue('id') as number,
      provider: row.getValue('provider') as string,
      name: row.getValue('name') as string,
      api_key: row.getValue('api_key') as string,
      is_active: row.getValue('is_active') as boolean,
      is_default: row.getValue('is_default') as boolean,
      created_at: row.getValue('created_at') as string,
      updated_at: row.getValue('updated_at') as string,
    })
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/update-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'api', id: editingValues.id, values: editingValues }),
      })
      if (!res.ok) throw new Error('업데이트 실패')
      toast.success('API 키가 성공적으로 수정되었습니다.')
      setEditingRowId(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('API 키 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  const handleCancelEdit = () => {
    setEditingRowId(null)
    setEditingValues({})
  }

  const handleDelete = async () => {
    try {
      const id = String(row.getValue('id'))
      const res = await fetch('/api/admin/delete-data', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'api', ids: [id] }),
      })
      if (!res.ok) throw new Error('삭제 실패')
      toast.success('API 키가 성공적으로 삭제되었습니다.')
      setIsDeleteOpen(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('API 키 삭제 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  if (editingRowId === (row.getValue('id') as number)) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex flex-col space-y-2">
          <Input
            value={(editingValues.name as string) ?? ''}
            onChange={(e) => setEditingValues((prev) => ({ ...prev, name: e.target.value }))}
            className="h-8"
            placeholder="이름"
          />
          <Input
            type="password"
            value={(editingValues.api_key as string) ?? ''}
            onChange={(e) => setEditingValues((prev) => ({ ...prev, api_key: e.target.value }))}
            className="h-8"
            placeholder="API 키"
          />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={Boolean(editingValues.is_active)}
                onChange={(e) => setEditingValues((prev) => ({ ...prev, is_active: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_active" className="text-sm">활성화</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={Boolean(editingValues.is_default)}
                onChange={(e) => setEditingValues((prev) => ({ ...prev, is_default: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_default" className="text-sm">기본값</Label>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-1">
          <Button size="sm" onClick={handleSaveEdit}>
            저장
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
            취소
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('api_key'))}>
            <Copy className="mr-2 h-4 w-4" />
            API 키 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 삭제 AlertDialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 이 API 키를 영구적으로 삭제하시겠습니까?
              <br />
              <strong>이름: {row.getValue('name')}</strong>
              <br />
              <strong>제공자: {row.getValue('provider')}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// EP 데이터 컬럼 정의
export const epDataColumns: ColumnDef<EpData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <EpIdCell row={row} />,
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => <EpTitleCell row={row} />,
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => <EpCreatedAtCell row={row} />,
  },
  {
    accessorKey: 'updated_at',
    header: '수정일',
    cell: ({ row }) => <EpUpdatedAtCell row={row} />,
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => <EpDataActions row={row} />,
  },
]

// 삭제된 아이템 컬럼 정의
export const deletedItemsColumns: ColumnDef<DeletedItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: '삭제 ID',
    cell: ({ row }) => <DeletedIdCell row={row} />,
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => <DeletedTitleCell row={row} />,
  },
  {
    accessorKey: 'created_at',
    header: '삭제일',
    cell: ({ row }) => <DeletedCreatedAtCell row={row} />,
  },
  {
    accessorKey: 'updated_at',
    header: '수정일',
    cell: ({ row }) => <DeletedUpdatedAtCell row={row} />,
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => <DeletedItemActions row={row} />,
  },
]

// API 키 컬럼 정의
export const apiKeyColumns: ColumnDef<ApiKey>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'provider',
    header: '제공자',
    cell: ({ row }) => <ApiProviderCell row={row} />,
  },
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => <ApiNameCell row={row} />,
  },
  {
    accessorKey: 'is_active',
    header: '활성',
    cell: ({ row }) => <ApiIsActiveCell row={row} />,
  },
  {
    accessorKey: 'is_default',
    header: '기본값',
    cell: ({ row }) => <ApiIsDefaultCell row={row} />,
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => <ApiCreatedAtCell row={row} />,
  },
  {
    accessorKey: 'updated_at',
    header: '수정일',
    cell: ({ row }) => <ApiUpdatedAtCell row={row} />,
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => <ApiKeyActions row={row} />,
  },
]

// 도시 이미지 컬럼 정의 (테이블이 존재하지 않음)
export const cityImagesColumns: ColumnDef<unknown>[] = []

// 제목 컬럼 정의 (테이블이 존재하지 않음)
export const titlesColumns: ColumnDef<unknown>[] = []