"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedTitle {
  id: string
  title: string
  category: string
  keywords: string[]
  createdAt: Date
}

interface KeywordTitleGeneratorProps {
  selectedModel: string
  selectedApiKeyId: number
  temperature: number
  maxTokens: number
}

export function KeywordTitleGenerator({ 
  selectedModel, 
  selectedApiKeyId, 
  temperature, 
  maxTokens 
}: KeywordTitleGeneratorProps) {
  const [location, setLocation] = useState('')
  const [productType, setProductType] = useState('')
  const [additionalKeywords, setAdditionalKeywords] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')

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

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'luxury', label: '럭셔리' },
    { value: 'budget', label: '저예산' },
    { value: 'adventure', label: '모험' },
    { value: 'romantic', label: '로맨틱' },
    { value: 'family', label: '가족' },
    { value: 'cultural', label: '문화' },
    { value: 'nature', label: '자연' }
  ]

  const generateTitles = async () => {
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
          modelId: selectedModel,
          apiKeyId: selectedApiKeyId,
          temperature,
          maxTokens
        }),
      })

      if (!response.ok) {
        throw new Error('제목 생성에 실패했습니다.')
      }

      const data = await response.json()
      
      const newTitles: GeneratedTitle[] = data.titles.map((title: any, index: number) => ({
        id: `title-${Date.now()}-${index}`,
        title: title.title,
        category: title.category,
        keywords: title.keywords || [],
        createdAt: new Date()
      }))

      setGeneratedTitles(prev => [...newTitles, ...prev])
      toast.success(`${newTitles.length}개의 제목이 생성되었습니다.`)
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

  const filteredTitles = selectedCategory === 'all' 
    ? generatedTitles 
    : generatedTitles.filter(title => title.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>키워드 기반 여행 상품 제목 생성</CardTitle>
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

          <Button 
            onClick={generateTitles} 
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
              <CardTitle>생성된 제목 ({filteredTitles.length}개)</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div key={title.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-lg leading-tight">{title.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(title.title)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{title.category}</Badge>
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
    </div>
  )
}
