'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react'
import { toast } from 'sonner'

import { EpData, DeletedItem, ApiKey, CityImage, Title } from '@/types/database'

// EP 데이터 컬럼 정의
export const epDataColumns: ColumnDef<EpData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모두 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('id')}
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return (
        <div className="max-w-[300px] truncate" title={title}>
          {title}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: '카테고리',
    cell: ({ row }) => {
      const category = row.getValue('category') as string
      return (
        <Badge variant="secondary">
          {category || '미분류'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleString('ko-KR')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(item.id)
                toast.success('ID가 복사되었습니다')
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              상세 보기
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
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
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모두 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('id')}
      </div>
    ),
  },
  {
    accessorKey: 'product_id',
    header: '상품 ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('product_id')}
      </div>
    ),
  },
  {
    accessorKey: 'title',
    header: '제목',
    cell: ({ row }) => {
      const title = row.getValue('title') as string
      return (
        <div className="max-w-[300px] truncate" title={title}>
          {title}
        </div>
      )
    },
  },
  {
    accessorKey: 'reason',
    header: '삭제 이유',
    cell: ({ row }) => {
      const reason = row.getValue('reason') as string
      return (
        <Badge variant="destructive">
          {reason}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: '삭제일',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleString('ko-KR')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(item.original_id)
                toast.success('상품 ID가 복사되었습니다')
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              상품 ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              상세 보기
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              영구 삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
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
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모두 선택"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="행 선택"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm">
        {row.getValue('id')}
      </div>
    ),
  },
  {
    accessorKey: 'provider',
    header: '제공자',
    cell: ({ row }) => {
      const provider = row.getValue('provider') as string
      return (
        <Badge variant="outline">
          {provider}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'name',
    header: '이름',
    cell: ({ row }) => {
      const name = row.getValue('name') as string
      return (
        <div className="max-w-[200px] truncate" title={name}>
          {name}
        </div>
      )
    },
  },
  {
    accessorKey: 'is_active',
    header: '상태',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? '활성' : '비활성'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleString('ko-KR')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(item.id.toString())
                toast.success('ID가 복사되었습니다')
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              ID 복사
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              상세 보기
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              수정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
