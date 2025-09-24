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

import { EpData, DeletedItem, ApiKey } from '@/types/database'
import { Row } from '@tanstack/react-table'

// EP 데이터 액션 컴포넌트
function EpDataActions({ row }: { row: Row<EpData> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editData, setEditData] = useState({
    title: row.getValue('title') as string,
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/update-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'ep_data',
          id: row.getValue('id') as string,
          values: { title: editData.title },
        }),
      })
      if (!res.ok) throw new Error('업데이트 실패')
      toast.success('데이터가 성공적으로 수정되었습니다.')
      setIsEditing(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('데이터 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      title: row.getValue('title') as string,
    })
    setIsEditing(false)
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

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          value={editData.title}
          onChange={(e) => setEditData({...editData, title: e.target.value})}
          className="h-8"
          placeholder="제목을 입력하세요"
        />
        <Button size="sm" onClick={handleSaveEdit}>
          저장
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
          취소
        </Button>
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

// 삭제된 아이템 액션 컴포넌트
function DeletedItemActions({ row }: { row: Row<DeletedItem> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editData, setEditData] = useState({
    title: (row.getValue('title') as string) || '',
  })

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/update-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'delect',
          id: row.getValue('id') as number,
          values: { title: editData.title },
        }),
      })
      if (!res.ok) throw new Error('업데이트 실패')
      toast.success('데이터가 성공적으로 수정되었습니다.')
      setIsEditing(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('데이터 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
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

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="h-8"
          placeholder="제목을 입력하세요"
        />
        <Button size="sm" onClick={handleSaveEdit}>저장</Button>
        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
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
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
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
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editData, setEditData] = useState({
    name: row.getValue('name') as string,
    provider: row.getValue('provider') as string,
    api_key: row.getValue('api_key') as string,
    is_active: row.getValue('is_active') as boolean,
    is_default: row.getValue('is_default') as boolean,
  })

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('/api/admin/update-data', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'api',
          id: row.getValue('id') as number,
          values: {
            name: editData.name,
            api_key: editData.api_key,
            is_active: editData.is_active,
            is_default: editData.is_default,
          },
        }),
      })
      if (!res.ok) throw new Error('업데이트 실패')
      toast.success('API 키가 성공적으로 수정되었습니다.')
      setIsEditing(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('admin-table-refresh'))
      }
    } catch (e) {
      toast.error('API 키 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      name: row.getValue('name') as string,
      provider: row.getValue('provider') as string,
      api_key: row.getValue('api_key') as string,
      is_active: row.getValue('is_active') as boolean,
      is_default: row.getValue('is_default') as boolean,
    })
    setIsEditing(false)
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

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex flex-col space-y-2">
          <Input
            value={editData.name}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
            className="h-8"
            placeholder="이름"
          />
          <Input
            type="password"
            value={editData.api_key}
            onChange={(e) => setEditData({...editData, api_key: e.target.value})}
            className="h-8"
            placeholder="API 키"
          />
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={editData.is_active}
                onChange={(e) => setEditData({...editData, is_active: e.target.checked})}
                className="rounded"
              />
              <Label htmlFor="is_active" className="text-sm">활성화</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={editData.is_default}
                onChange={(e) => setEditData({...editData, is_default: e.target.checked})}
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
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    accessorKey: 'updated_at',
    header: '수정일',
    cell: ({ row }) => format(new Date(row.getValue('updated_at')), 'yyyy-MM-dd HH:mm'),
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
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'created_at',
    header: '삭제일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    accessorKey: 'updated_at',
    header: '수정일',
    cell: ({ row }) => format(new Date(row.getValue('updated_at')), 'yyyy-MM-dd HH:mm'),
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
    cell: ({ row }) => (
      <Badge variant={row.getValue('provider') === 'openai' ? 'default' : 'secondary'}>
        {row.getValue('provider')}
      </Badge>
    ),
  },
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'is_active',
    header: '활성',
    cell: ({ row }) => (
      <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
        {row.getValue('is_active') ? '활성' : '비활성'}
      </Badge>
    ),
  },
  {
    accessorKey: 'is_default',
    header: '기본값',
    cell: ({ row }) => (
      <Badge variant={row.getValue('is_default') ? 'default' : 'secondary'}>
        {row.getValue('is_default') ? '기본' : '일반'}
      </Badge>
    ),
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    accessorKey: 'updated_at',
    header: '수정일',
    cell: ({ row }) => format(new Date(row.getValue('updated_at')), 'yyyy-MM-dd HH:mm'),
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