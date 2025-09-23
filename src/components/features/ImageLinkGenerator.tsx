'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckSquare, Download, Minus, Plus, RefreshCw } from 'lucide-react'

type ImageEntry = {
  url: string
  isMain: boolean
}

function getRandomInt(min: number, max: number) {
  const minCeil = Math.ceil(min)
  const maxFloor = Math.floor(max)
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil
}

function shuffleArray<T>(array: T[]): T[] {
  const a = array.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function ImageLinkGenerator() {
  const [entries, setEntries] = useState<ImageEntry[]>([{ url: '', isMain: false }])
  const [numRows, setNumRows] = useState<number>(10)

  const uniqueEntries = useMemo(() => {
    const seen = new Set<string>()
    const result: ImageEntry[] = []
    for (const e of entries) {
      const trimmed = e.url.trim()
      if (!trimmed) continue
      if (seen.has(trimmed)) continue
      seen.add(trimmed)
      result.push({ url: trimmed, isMain: e.isMain })
    }
    return result.slice(0, 11)
  }, [entries])

  const mainCandidates = useMemo(() => {
    const checked = uniqueEntries.filter(e => e.isMain)
    if (checked.length > 0) return checked
    // 아무것도 체크 안했으면 전부 메인이미지 후보
    return uniqueEntries
  }, [uniqueEntries])

  const handleAddEntry = () => {
    if (uniqueEntries.length >= 11) {
      toast.warning('최대 11개까지 추가할 수 있어요')
      return
    }
    setEntries(prev => [...prev, { url: '', isMain: false }])
  }

  const handleRemoveEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleChangeUrl = (index: number, value: string) => {
    setEntries(prev => prev.map((e, i) => (i === index ? { ...e, url: value } : e)))
  }

  const handleToggleMain = (index: number) => {
    setEntries(prev => prev.map((e, i) => (i === index ? { ...e, isMain: !e.isMain } : e)))
  }

  const handleReset = () => {
    setEntries([{ url: '', isMain: false }])
    setNumRows(10)
  }

  const handleGenerateXlsx = async () => {
    if (uniqueEntries.length === 0) {
      toast.error('이미지 링크를 최소 1개 이상 입력해주세요')
      return
    }
    if (numRows <= 0) {
      toast.error('생성할 행 수를 1 이상으로 입력해주세요')
      return
    }

    const allUrls = uniqueEntries.map(e => e.url)
    const mainPool = mainCandidates.map(e => e.url)
    if (mainPool.length === 0) {
      toast.error('메인 후보가 없습니다. 링크를 확인해주세요')
      return
    }

    const rows: { image_link: string; add_image_link: string }[] = []
    for (let i = 0; i < numRows; i++) {
      const imageLink = mainPool[getRandomInt(0, mainPool.length - 1)]
      const addList = shuffleArray(allUrls)
      const addImageLink = addList.join('|')
      rows.push({ image_link: imageLink, add_image_link: addImageLink })
    }

    try {
      const XLSX = await import('xlsx')
      const header = ['image_link', 'add_image_link']
      const aoa = [header, ...rows.map(r => [r.image_link, r.add_image_link])]
      const ws = XLSX.utils.aoa_to_sheet(aoa)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'image_links')
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'image_links.xlsx'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`${rows.length}개 행을 엑셀로 생성했어요`)
    } catch (e) {
      console.error(e)
      toast.error('엑셀 생성 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            이미지 링크 생성기
          </CardTitle>
          <CardDescription>
            최대 11개의 이미지 링크를 입력하고, 메인이미지 여부를 선택한 후 CSV를 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 좌측: 설정 + 입력 */}
              <div className="space-y-6">
                {/* 설정 영역 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="num-rows">생성할 행 수</Label>
                    <Input
                      id="num-rows"
                      type="number"
                      min={1}
                      value={numRows}
                      onChange={(e) => setNumRows(Number(e.target.value))}
                    />
                  </div>
                  {/* add_image_link 최대 입력 제거 */}
                </div>

                {/* 벌크 붙여넣기 제거. 초기화 버튼만 유지할 수 있도록 간단 버튼 제공 */}
                <div>
                  <Button variant="secondary" type="button" onClick={() => handleReset()}>
                    <RefreshCw className="h-4 w-4" /> 초기화
                  </Button>
                </div>

                {/* 입력 테이블 (간소 뷰) */}
                <div className="relative w-full overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">메인</TableHead>
                        <TableHead>이미지 링크</TableHead>
                        <TableHead className="w-20">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <input
                              type="checkbox"
                              aria-label={`메인 체크 ${index + 1}`}
                              checked={!!entry.isMain}
                              onChange={() => handleToggleMain(index)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder={`https://example.com/image-${index + 1}.jpg`}
                              value={entry.url}
                              onChange={(e) => handleChangeUrl(index, e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" type="button" onClick={() => handleRemoveEntry(index)} aria-label="행 삭제">
                                <Minus className="h-4 w-4" />
                              </Button>
                              {index === entries.length - 1 && entries.length < 11 && (
                                <Button variant="outline" size="icon" type="button" onClick={handleAddEntry} aria-label="행 추가" disabled={uniqueEntries.length >= 11}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {entries.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <div className="text-sm text-gray-500">행이 없습니다. 항목 추가를 눌러주세요.</div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="p-2 text-xs text-muted-foreground">
                    아무 것도 체크하지 않으면 모든 링크가 메인 후보로 사용됩니다. 최대 11개까지 추가할 수 있어요.
                  </div>
                </div>
              </div>

              {/* 우측: 미리보기 & 상태 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>상태 요약</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">고유 링크: {uniqueEntries.length} / 11</Badge>
                    <Badge variant="outline">메인 후보: {mainCandidates.length}</Badge>
                    {/* add 최대 배지 */}
                  </div>
                </div>

                <div className="relative w-full overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>예시 image_link</TableHead>
                        <TableHead>예시 add_image_link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* 간단한 미리보기 */}
                      <TableRow>
                        <TableCell className="truncate max-w-xs" title={mainCandidates[0]?.url || ''}>
                          {mainCandidates[0]?.url || '-'}
                        </TableCell>
                        <TableCell className="truncate max-w-xs" title={uniqueEntries.map(e => e.url).join('|')}>
                          {uniqueEntries.map(e => e.url).join('|') || '-'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="p-2 text-xs text-muted-foreground">
                    아무 것도 체크하지 않으면 모든 링크가 메인 후보로 사용됩니다. 최대 11개까지 추가할 수 있어요.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
            <div className="w-full flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>행 수: {numRows}</span>
              <span>·</span>
              <span>고유 링크: {uniqueEntries.length}/11</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleGenerateXlsx} className="px-4" variant="secondary" disabled={uniqueEntries.length === 0}>
                <Download className="h-4 w-4" /> 엑셀(xlsx)
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ImageLinkGenerator


