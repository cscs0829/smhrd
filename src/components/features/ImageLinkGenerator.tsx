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
  const [excludeDuplicates, setExcludeDuplicates] = useState<boolean>(false)

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

  const previewRows = useMemo(() => {
    if (uniqueEntries.length === 0) return []
    
    const rows = []
    const maxPreviewRows = Math.min(uniqueEntries.length, 5) // 최대 5개까지 미리보기
    
    for (let i = 0; i < maxPreviewRows; i++) {
      const imageLink = mainCandidates[getRandomInt(0, mainCandidates.length - 1)].url
      
      let addEntries = uniqueEntries
      // 중복 제외 옵션이 체크되어 있으면 현재 image_link 제외
      if (excludeDuplicates) {
        addEntries = uniqueEntries.filter(e => e.url !== imageLink)
      }
      
      const addList = shuffleArray(addEntries)
      const addImageLink = addList.map(e => e.url).join('|')
      rows.push({ image_link: imageLink, add_image_link: addImageLink })
    }
    return rows
  }, [uniqueEntries, mainCandidates, excludeDuplicates])

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

  const handleKeyPress = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // 현재 입력창이 비어있지 않고, 마지막 행이 아니며, 11개 미만인 경우에만 새 행 추가
      if (entries[index].url.trim() && index === entries.length - 1 && entries.length < 11) {
        setEntries(prev => [...prev, { url: '', isMain: false }])
        // 다음 입력창으로 포커스 이동
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-input-index="${index + 1}"]`) as HTMLInputElement
          if (nextInput) {
            nextInput.focus()
          }
        }, 0)
      }
    }
  }

  const handleToggleMain = (index: number) => {
    setEntries(prev => prev.map((e, i) => (i === index ? { ...e, isMain: !e.isMain } : e)))
  }

  const handleReset = () => {
    setEntries([{ url: '', isMain: false }])
    setNumRows(10)
    setExcludeDuplicates(false)
  }

  const handleGenerateXlsx = async () => {
    // 최소 5개, 최대 11개 검증
    if (uniqueEntries.length < 5) {
      toast.error('이미지 링크를 최소 5개 이상 입력해주세요')
      return
    }
    if (uniqueEntries.length > 11) {
      toast.error('이미지 링크는 최대 11개까지 입력할 수 있습니다')
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
      
      let addUrls = allUrls
      // 중복 제외 옵션이 체크되어 있으면 현재 image_link 제외
      if (excludeDuplicates) {
        addUrls = allUrls.filter(url => url !== imageLink)
      }
      
      // add_image_link 개수 검증 (최소 5개, 최대 10개)
      if (addUrls.length < 5) {
        toast.error('중복 제외 옵션을 사용할 때 add_image_link가 최소 5개 이상이어야 합니다')
        return
      }
      if (addUrls.length > 10) {
        toast.error('add_image_link는 최대 10개까지 사용할 수 있습니다')
        return
      }
      
      const addList = shuffleArray(addUrls.map(url => ({ url, isMain: false })))
      const addImageLink = addList.map(e => e.url).join('|')
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
                  <div className="space-y-2">
                    <Label>중복 제외 옵션</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="exclude-duplicates"
                        checked={excludeDuplicates}
                        onChange={(e) => setExcludeDuplicates(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="exclude-duplicates" className="text-sm">
                        같은 행의 image_link는 add_image_link에서 제외
                      </Label>
                    </div>
                  </div>
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
                              onKeyDown={(e) => handleKeyPress(index, e)}
                              data-input-index={index}
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
                    <div className="mb-2">
                      • 최소 5개, 최대 11개까지 이미지링크 입력 가능<br/>
                      • 아무 것도 체크하지 않으면 모든 링크가 메인 후보로 사용됩니다<br/>
                      • 중복 제외 옵션 사용 시 add_image_link는 최소 5개, 최대 10개까지
                    </div>
                    <span className="text-blue-600 font-medium">💡 팁: 이미지링크를 입력한 후 엔터키를 누르면 자동으로 다음 입력창이 생성됩니다!</span>
                  </div>
                </div>
              </div>

              {/* 우측: 미리보기 & 상태 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>상태 요약</Label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={uniqueEntries.length >= 5 && uniqueEntries.length <= 11 ? "default" : "destructive"}>
                      고유 링크: {uniqueEntries.length} / 11
                    </Badge>
                    <Badge variant="outline">메인 후보: {mainCandidates.length}</Badge>
                    {excludeDuplicates && (
                      <Badge variant="secondary">중복 제외 활성</Badge>
                    )}
                  </div>
                  {/* 검증 에러 메시지 */}
                  {uniqueEntries.length < 5 && (
                    <div className="text-red-500 text-sm">
                      ⚠️ 이미지 링크를 최소 5개 이상 입력해주세요
                    </div>
                  )}
                  {uniqueEntries.length > 11 && (
                    <div className="text-red-500 text-sm">
                      ⚠️ 이미지 링크는 최대 11개까지 입력할 수 있습니다
                    </div>
                  )}
                  {excludeDuplicates && uniqueEntries.length < 6 && (
                    <div className="text-red-500 text-sm">
                      ⚠️ 중복 제외 옵션 사용 시 최소 6개 이상 입력해야 합니다
                    </div>
                  )}
                  {excludeDuplicates && uniqueEntries.length > 11 && (
                    <div className="text-red-500 text-sm">
                      ⚠️ add_image_link는 최대 10개까지 사용할 수 있습니다
                    </div>
                  )}
                </div>

                <div className="relative w-full border rounded-lg">
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-1/3">예시 image_link</TableHead>
                          <TableHead className="w-2/3">예시 add_image_link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* 미리보기 행들 */}
                        {previewRows.length > 0 ? (
                          previewRows.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="align-top">
                                <div className="break-all text-xs p-1 bg-gray-50 rounded min-h-[40px] flex items-center">
                                  {row.image_link}
                                </div>
                              </TableCell>
                              <TableCell className="align-top">
                                <div className="break-all text-xs p-1 bg-gray-50 rounded min-h-[40px]">
                                  {row.add_image_link}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-500">
                              이미지링크를 입력하면 예시가 표시됩니다
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
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


