'use client'

import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckSquare, Download, Minus, Plus, RefreshCw, Search, AlertTriangle, CheckCircle, ExternalLink, Copy } from 'lucide-react'

type ImageEntry = {
  url: string
  isMain: boolean
}

type DuplicateCheckResult = {
  totalLinks: number
  uniqueLinks: number
  duplicateLinks: string[]
  allLinks: string[]
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
  const [results, setResults] = useState<{ image_link: string; add_image_link: string }[]>([])
  
  // 중복 검사 관련 상태
  const [duplicateCheckInput, setDuplicateCheckInput] = useState<string>('')
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<DuplicateCheckResult | null>(null)
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState<boolean>(false)

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
    setResults([])
  }

  const validateAndBuildRows = (): { image_link: string; add_image_link: string }[] | null => {
    if (uniqueEntries.length < 5) {
      toast.error('이미지 링크를 최소 5개 이상 입력해주세요')
      return null
    }
    if (uniqueEntries.length > 11) {
      toast.error('이미지 링크는 최대 11개까지 입력할 수 있습니다')
      return null
    }
    if (numRows <= 0) {
      toast.error('생성할 행 수를 1 이상으로 입력해주세요')
      return null
    }

    const allUrls = uniqueEntries.map(e => e.url)
    const mainPool = mainCandidates.map(e => e.url)
    if (mainPool.length === 0) {
      toast.error('메인 후보가 없습니다. 링크를 확인해주세요')
      return null
    }

    const built: { image_link: string; add_image_link: string }[] = []
    for (let i = 0; i < numRows; i++) {
      const imageLink = mainPool[getRandomInt(0, mainPool.length - 1)]

      let addUrls = allUrls
      if (excludeDuplicates) {
        addUrls = allUrls.filter(url => url !== imageLink)
      }

      if (addUrls.length < 5) {
        toast.error('중복 제외 옵션을 사용할 때 add_image_link가 최소 5개 이상이어야 합니다')
        return null
      }
      if (addUrls.length > 10) {
        toast.error('add_image_link는 최대 10개까지 사용할 수 있습니다')
        return null
      }

      const addList = shuffleArray(addUrls.map(url => ({ url, isMain: false })))
      const addImageLink = addList.map(e => e.url).join('|')
      built.push({ image_link: imageLink, add_image_link: addImageLink })
    }
    return built
  }

  const handleExecute = () => {
    const built = validateAndBuildRows()
    if (!built) return
    setResults(built)
    toast.success(`${built.length}개 행을 생성했어요`)
  }

  const handleCopyResults = async () => {
    if (results.length === 0) {
      toast.error('복사할 결과가 없습니다. 먼저 실행해주세요')
      return
    }
    const header = ['image_link', 'add_image_link']
    const lines = [header.join('\t'), ...results.map(r => [r.image_link, r.add_image_link].join('\t'))]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      toast.success('결과를 클립보드에 복사했어요 (엑셀에 바로 붙여넣기)')
    } catch (e) {
      toast.error('클립보드 복사에 실패했습니다')
    }
  }

  const handleGenerateXlsx = async () => {
    const rows = results.length > 0 ? results : validateAndBuildRows()
    if (!rows || rows.length === 0) return

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

  const handleDuplicateCheck = () => {
    if (!duplicateCheckInput.trim()) {
      toast.error('링크를 입력해주세요')
      return
    }

    setIsCheckingDuplicates(true)
    
    try {
      // |로 구분된 링크들을 분리
      const links = duplicateCheckInput
        .split('|')
        .map(link => link.trim())
        .filter(link => link.length > 0)

      if (links.length === 0) {
        toast.error('유효한 링크가 없습니다')
        setIsCheckingDuplicates(false)
        return
      }

      // 중복 검사
      const linkCount = new Map<string, number>()
      const duplicateLinks: string[] = []
      
      links.forEach(link => {
        const count = linkCount.get(link) || 0
        linkCount.set(link, count + 1)
        if (count === 1) { // 두 번째 발견 시 중복으로 기록
          duplicateLinks.push(link)
        }
      })

      const uniqueLinks = Array.from(linkCount.keys())
      
      const result: DuplicateCheckResult = {
        totalLinks: links.length,
        uniqueLinks: uniqueLinks.length,
        duplicateLinks: duplicateLinks,
        allLinks: links
      }

      setDuplicateCheckResult(result)
      
      if (duplicateLinks.length > 0) {
        toast.warning(`${duplicateLinks.length}개의 중복 링크를 발견했습니다`)
      } else {
        toast.success('중복 링크가 없습니다')
      }
    } catch (error) {
      toast.error('중복 검사 중 오류가 발생했습니다')
    } finally {
      setIsCheckingDuplicates(false)
    }
  }

  const handleClearDuplicateCheck = () => {
    setDuplicateCheckInput('')
    setDuplicateCheckResult(null)
  }

  const handleOpenLink = (url: string) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error('링크를 열 수 없습니다')
    }
  }

  const handleCopyLink = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type}이 클립보드에 복사되었습니다`)
    } catch (error) {
      toast.error('복사에 실패했습니다')
    }
  }


  return (
    <div className="space-y-6">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
                  {/* 실행 및 결과 영역 */}
                  <div className="mt-3 border rounded-lg">
                    <div className="flex items-center justify-between p-3 gap-2 flex-wrap">
                      <div className="text-sm font-medium">
                        결과 {results.length > 0 ? `(${results.length}행)` : ''}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button type="button" onClick={handleExecute}>
                          실행
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCopyResults} disabled={results.length === 0}>
                          복사
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleGenerateXlsx} disabled={results.length === 0}>
                          <Download className="h-4 w-4" /> 엑셀
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {results.length > 0 ? (
                        <Table>
                          <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-1/2 max-w-[300px]">image_link</TableHead>
                          <TableHead className="w-1/2 max-w-[300px]">add_image_link</TableHead>
                        </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.map((row, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="align-top p-2 max-w-[300px]">
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="flex-1 overflow-x-auto scrollbar-hide max-w-[220px]"
                                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                      <div className="text-xs p-1 bg-gray-50 rounded whitespace-nowrap">
                                        {row.image_link}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleCopyLink(row.image_link, 'image_link')}
                                      className="p-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                      title="링크 복사"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                </TableCell>
                                <TableCell className="align-top p-2 max-w-[300px]">
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="flex-1 overflow-x-auto scrollbar-hide max-w-[220px]"
                                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                      <div className="text-xs p-1 bg-gray-50 rounded whitespace-nowrap">
                                        {row.add_image_link}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleCopyLink(row.add_image_link, 'add_image_link')}
                                      className="p-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                      title="링크 복사"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="p-3 text-sm text-muted-foreground">실행을 클릭하면 결과가 표시됩니다</div>
                      )}
                    </div>
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

      {/* 중복 검사기 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            이미지 링크 중복 검사기
          </CardTitle>
          <CardDescription>
            |로 구분된 이미지 링크들을 입력하여 중복을 검사합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="duplicate-check-input">이미지 링크 입력</Label>
              <div className="space-y-2">
                <Input
                  id="duplicate-check-input"
                  placeholder="https://example.com/image1.jpg|https://example.com/image2.jpg|https://example.com/image3.jpg"
                  value={duplicateCheckInput}
                  onChange={(e) => setDuplicateCheckInput(e.target.value)}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  링크들을 | (파이프) 문자로 구분하여 입력하세요
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleDuplicateCheck}
                disabled={isCheckingDuplicates || !duplicateCheckInput.trim()}
                className="flex-1"
              >
                {isCheckingDuplicates ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    검사 중...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    중복 검사 실행
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClearDuplicateCheck}
                disabled={isCheckingDuplicates}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                초기화
              </Button>
            </div>

            {/* 검사 결과 */}
            {duplicateCheckResult && (
              <div className="space-y-4">
                {/* 요약 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
                    <div className="px-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-blue-700">전체 링크</p>
                            <p className="text-2xl font-bold text-blue-600">{duplicateCheckResult.totalLinks}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          전체 보기
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
                    <div className="px-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-700">고유 링크</p>
                            <p className="text-2xl font-bold text-green-600">{duplicateCheckResult.uniqueLinks}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          고유 링크 보기
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm ${duplicateCheckResult.duplicateLinks.length > 0 ? 'border-red-200' : 'border-gray-200'}`}>
                    <div className="px-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {duplicateCheckResult.duplicateLinks.length > 0 ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-gray-600" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${duplicateCheckResult.duplicateLinks.length > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                              중복 링크
                            </p>
                            <p className={`text-2xl font-bold ${duplicateCheckResult.duplicateLinks.length > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {duplicateCheckResult.duplicateLinks.length}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          className={`${duplicateCheckResult.duplicateLinks.length > 0 ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          disabled={duplicateCheckResult.duplicateLinks.length === 0}
                        >
                          {duplicateCheckResult.duplicateLinks.length > 0 ? (
                            <>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              중복 보기
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              중복 없음
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 중복 링크 목록 */}
                {duplicateCheckResult.duplicateLinks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-red-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      중복된 링크 ({duplicateCheckResult.duplicateLinks.length}개)
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>순번</TableHead>
                            <TableHead>중복 링크</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {duplicateCheckResult.duplicateLinks.map((link, index) => (
                            <TableRow key={index}>
                              <TableCell className="w-16">{index + 1}</TableCell>
                              <TableCell>
                                <div className="break-all text-sm font-mono bg-red-50 p-2 rounded">
                                  {link}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 전체 링크 목록 */}
                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    전체 링크 목록 ({duplicateCheckResult.allLinks.length}개)
                  </h4>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="w-12">순번</TableHead>
                          <TableHead className="w-[550px]">링크</TableHead>
                          <TableHead className="w-16">상태</TableHead>
                          <TableHead className="w-16">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {duplicateCheckResult.allLinks.map((link, index) => {
                          const isDuplicate = duplicateCheckResult.duplicateLinks.includes(link)
                          return (
                            <TableRow key={index}>
                              <TableCell className="w-12">{index + 1}</TableCell>
                              <TableCell className="w-[550px]">
                                <div className="flex items-center gap-1">
                                  <div 
                                    className="flex-1 overflow-x-auto scrollbar-hide max-w-[510px]"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                  >
                                    <div className="text-xs font-mono bg-gray-50 p-1 rounded whitespace-nowrap">
                                      {link}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleCopyLink(link, '링크')}
                                    className="p-1 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                    title="링크 복사"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </TableCell>
                              <TableCell className="w-16">
                                {isDuplicate ? (
                                  <Badge variant="destructive" className="text-xs">
                                    중복
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    고유
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="w-16">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenLink(link)}
                                  className="h-8 px-2 text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  열기
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImageLinkGenerator


