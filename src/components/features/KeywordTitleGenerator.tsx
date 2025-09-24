"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { AIModelSelector } from '@/components/features/AIModelSelector'
import { DuplicateChecker } from '@/components/features/DuplicateChecker'
import { getRecommendedModel } from '@/lib/ai-models'
import { useApiKeys } from '@/contexts/ApiKeyContext'

interface GeneratedTitle {
  id: string
  title: string
  category: string
  keywords: string[]
  createdAt: Date
}

export function KeywordTitleGenerator() {
  const { apiKeys } = useApiKeys()
  
  // AI 모델 설정을 내부에서 관리
  const [selectedModel, setSelectedModel] = useState<string>(getRecommendedModel().id)
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('')
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(100)
  const [location, setLocation] = useState('')
  const [productType, setProductType] = useState('')
  const [additionalKeywords, setAdditionalKeywords] = useState('')
  const [titleCount, setTitleCount] = useState<number>(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([])

  // 활성 상태인 API 키를 자동으로 선택 (기본값 우선)
  useEffect(() => {
    if (apiKeys.length > 0 && selectedApiKeyId === '') {
      // 기본값으로 설정된 API 키를 먼저 찾기
      const defaultApiKey = apiKeys.find(key => key.isActive && key.isDefault)
      if (defaultApiKey) {
        setSelectedApiKeyId(defaultApiKey.id)
      } else {
        // 기본값이 없으면 활성 상태인 API 키 중에서 첫 번째 선택
        const activeApiKey = apiKeys.find(key => key.isActive)
        if (activeApiKey) {
          setSelectedApiKeyId(activeApiKey.id)
        } else {
          // 활성 상태인 키가 없으면 첫 번째 키 선택
          setSelectedApiKeyId(apiKeys[0].id)
        }
      }
    }
  }, [apiKeys, selectedApiKeyId])

  const productTypes = [
    '패키지 여행',
    '자유여행',
    '단체여행',
    '신혼여행',
    '가족여행',
    '친구여행',
    '혼자여행',
    '비즈니스여행',
    '문화여행',
    '자연여행',
    '도시여행',
    '해변여행',
    '산악여행',
    '음식여행',
    '쇼핑여행'
  ]

  // 카테고리 필터링 제거 - 모든 제목을 통합 관리

  const generateTitles = async (excludeTitles: string[] = []) => {
    if (!location.trim()) {
      toast.error('나라나 도시를 입력해주세요.')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          productType: productType || '패키지 여행',
          additionalKeywords: additionalKeywords.trim(),
          titleCount: excludeTitles.length > 0 ? excludeTitles.length : titleCount,
          modelId: selectedModel,
          apiKeyId: selectedApiKeyId,
          temperature,
          maxTokens,
          excludeTitles // 중복 제목 제외를 위한 매개변수 추가
        }),
      })

      if (!response.ok) {
        throw new Error('제목 생성에 실패했습니다.')
      }

      const data = await response.json()
      
      const newTitles: GeneratedTitle[] = data.titles.map((title: { title: string; category: string; keywords: string[] }, index: number) => ({
        id: `title-${Date.now()}-${index}`,
        title: title.title,
        category: title.category,
        keywords: title.keywords || [],
        createdAt: new Date()
      }))

      if (excludeTitles.length > 0) {
        // 중복 제목들을 기존 목록에서 제거하고 새 제목들로 교체
        setGeneratedTitles(prev => {
          const filtered = prev.filter(title => !excludeTitles.includes(title.title))
          return [...newTitles, ...filtered]
        })
        toast.success(`${excludeTitles.length}개의 중복 제목이 ${newTitles.length}개의 새 제목으로 교체되었습니다.`)
      } else {
        setGeneratedTitles(prev => [...newTitles, ...prev])
        toast.success(`${newTitles.length}개의 제목이 생성되었습니다.`)
      }
    } catch (error) {
      console.error('제목 생성 오류:', error)
      toast.error(error instanceof Error ? error.message : '제목 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('클립보드에 복사되었습니다.')
  }

  const downloadTitles = () => {
    const csvContent = [
      '제목,카테고리,키워드,생성일시',
      ...generatedTitles.map(title => 
        `"${title.title}","${title.category}","${title.keywords.join(', ')}","${title.createdAt.toLocaleString()}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `여행상품제목_${location}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const clearTitles = () => {
    setGeneratedTitles([])
    toast.success('생성된 제목이 모두 삭제되었습니다.')
  }

  // 모든 제목 표시 (카테고리 필터링 제거)
  const filteredTitles = generatedTitles

  return (
    <div className="space-y-6">
      {/* AI 모델 선택기 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">AI 모델 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <AIModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            selectedApiKeyId={selectedApiKeyId}
            onApiKeyChange={setSelectedApiKeyId}
            temperature={temperature}
            onTemperatureChange={setTemperature}
            maxTokens={maxTokens}
            onMaxTokensChange={setMaxTokens}
          />
        </CardContent>
      </Card>

      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">키워드 기반 여행 상품 제목 생성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">나라/도시 *</Label>
              <Input
                id="location"
                placeholder="예: 파리, 도쿄, 뉴욕, 이탈리아"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productType">상품 유형</Label>
              <Select value={productType} onValueChange={setProductType} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="상품 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalKeywords">추가 키워드 (선택사항)</Label>
            <Input
              id="additionalKeywords"
              placeholder="예: 저렴한, 프리미엄, 가족친화적, 모험"
              value={additionalKeywords}
              onChange={(e) => setAdditionalKeywords(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titleCount">생성할 제목 개수</Label>
            <Select value={titleCount.toString()} onValueChange={(value) => setTitleCount(parseInt(value))} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue placeholder="제목 개수를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3개</SelectItem>
                <SelectItem value="5">5개</SelectItem>
                <SelectItem value="8">8개</SelectItem>
                <SelectItem value="10">10개</SelectItem>
                <SelectItem value="15">15개</SelectItem>
                <SelectItem value="20">20개</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => generateTitles()} 
            disabled={isGenerating || !location.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                제목 생성 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                제목 생성하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 생성된 제목 목록 */}
      {generatedTitles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">생성된 제목 ({filteredTitles.length}개)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadTitles}>
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
                <Button variant="outline" size="sm" onClick={clearTitles}>
                  전체 삭제
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTitles.map((title) => (
                <div key={title.id} className="border rounded-lg p-4 space-y-2 bg-card text-card-foreground border-border">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-lg leading-tight text-foreground">{title.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(title.title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {title.createdAt.toLocaleString()}
                    </span>
                  </div>
                  {title.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {title.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 중복 검사 */}
      {generatedTitles.length > 0 && (
        <DuplicateChecker
          generatedTitles={generatedTitles.map(title => ({
            title: title.title,
            category: title.category,
            keywords: title.keywords
          }))}
          onRegenerateTitles={generateTitles}
        />
      )}
    </div>
  )
}
