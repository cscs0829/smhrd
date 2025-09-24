'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react'
// import { toast } from 'sonner'
import { format } from 'date-fns'

import { EpData, DeletedItem, ApiKey, CityImage, Title } from '@/types/database'

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
    accessorKey: 'price_pc',
    header: '가격 (PC)',
    cell: ({ row }) => <div className="text-right">{row.getValue('price_pc')?.toLocaleString()}</div>,
  },
  {
    accessorKey: 'brand',
    header: '브랜드',
    cell: ({ row }) => <div className="font-medium">{row.getValue('brand') || 'N/A'}</div>,
  },
  {
    accessorKey: 'city',
    header: '도시',
    cell: ({ row }) => <div className="font-medium">{row.getValue('city') || 'N/A'}</div>,
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
    cell: ({ row }) => (
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
    ),
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
    accessorKey: 'original_id',
    header: '원본 ID',
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue('original_id')}</div>,
  },
  {
    accessorKey: 'original_data.title',
    header: '원본 제목',
    cell: ({ row }) => {
      const originalData: EpData = row.getValue('original_data')
      return <div className="max-w-[200px] truncate">{originalData?.title || 'N/A'}</div>
    },
  },
  {
    accessorKey: 'reason',
    header: '삭제 이유',
    cell: ({ row }) => <Badge variant="destructive">{row.getValue('reason') || 'N/A'}</Badge>,
  },
  {
    accessorKey: 'created_at',
    header: '삭제일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    id: 'actions',
    header: '액션',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
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
    ),
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
    accessorKey: 'usage_count',
    header: '사용 횟수',
    cell: ({ row }) => <div className="text-right">{row.getValue('usage_count')}</div>,
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    accessorKey: 'last_used_at',
    header: '마지막 사용일',
    cell: ({ row }) => {
      const lastUsedAt = row.getValue('last_used_at')
      return lastUsedAt && typeof lastUsedAt === 'string' ? format(new Date(lastUsedAt), 'yyyy-MM-dd HH:mm') : 'N/A'
    },
  },
  {
    id: 'actions',
    header: '액션',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
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
    ),
  },
]

// 도시 이미지 컬럼 정의
export const cityImagesColumns: ColumnDef<CityImage>[] = [
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
    accessorKey: 'city',
    header: '도시',
    cell: ({ row }) => <div className="font-medium">{row.getValue('city')}</div>,
  },
  {
    accessorKey: 'image_link',
    header: '이미지 링크',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-blue-600 hover:text-blue-800">
        <a href={row.getValue('image_link')} target="_blank" rel="noopener noreferrer">
          {row.getValue('image_link')}
        </a>
      </div>
    ),
  },
  {
    accessorKey: 'is_main_image',
    header: '메인 이미지',
    cell: ({ row }) => (
      <Badge variant={row.getValue('is_main_image') === 1 ? 'default' : 'secondary'}>
        {row.getValue('is_main_image') === 1 ? '메인' : '추가'}
      </Badge>
    ),
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">메뉴 열기</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>액션</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.getValue('image_link'))}>
            <Copy className="mr-2 h-4 w-4" />
            링크 복사
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => window.open(row.getValue('image_link'), '_blank')}>
            <Eye className="mr-2 h-4 w-4" />
            이미지 보기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

// 제목 컬럼 정의
export const titlesColumns: ColumnDef<Title>[] = [
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
    cell: ({ row }) => <div className="max-w-[300px] truncate">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'city',
    header: '도시',
    cell: ({ row }) => <div className="font-medium">{row.getValue('city') || 'N/A'}</div>,
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    cell: ({ row }) => format(new Date(row.getValue('created_at')), 'yyyy-MM-dd HH:mm'),
  },
  {
    id: 'actions',
    header: '액션',
    cell: ({ row }) => (
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
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
