'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Wand2, Copy, Check } from 'lucide-react';

interface GeneratedTitle {
  id: string;
  title: string;
  keywords: string[];
}

interface ApiKey {
  id: string;
  name: string;
  model_id: string;
  is_active: boolean;
}

export default function KeywordTitleGenerator() {
  const [location, setLocation] = useState('');
  const [productType, setProductType] = useState('패키지 여행');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [titleCount, setTitleCount] = useState(5);
  const [apiKeyId, setApiKeyId] = useState('');
  const [modelId, setModelId] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(100);
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  // API 키 목록 가져오기
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await fetch('/api/api-keys');
        if (response.ok) {
          const data = await response.json();
          setApiKeys(data.apiKeys || []);
          if (data.apiKeys && data.apiKeys.length > 0) {
            setApiKeyId(data.apiKeys[0].id);
            setModelId(data.apiKeys[0].model_id);
          }
        }
      } catch (error) {
        console.error('API 키 조회 오류:', error);
      }
    };

    fetchApiKeys();
  }, []);

  const handleGenerateTitles = async () => {
    if (!location.trim()) {
      setError('나라/도시를 입력해주세요.');
      return;
    }

    if (!apiKeyId) {
      setError('API 키를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTitles([]);

    try {
      const response = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location.trim(),
          productType,
          additionalKeywords: additionalKeywords.trim(),
          titleCount,
          modelId,
          apiKeyId,
          temperature,
          maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '제목 생성에 실패했습니다.');
      }

      const data = await response.json();
      setTitles(data.titles || []);
    } catch (err) {
      console.error('제목 생성 오류:', err);
      setError(err instanceof Error ? err.message : '제목 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedTitle(title);
      setTimeout(() => setCopiedTitle(null), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI 여행 상품 제목 생성기
          </CardTitle>
          <CardDescription>
            네이버 가격비교 상위 노출을 위한 SEO 최적화 여행 상품 제목을 생성합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                나라/도시 <span className="text-red-500">*</span>
              </label>
              <Input
                id="location"
                placeholder="예: 홋카이도, 스페인, 파리"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="productType" className="block text-sm font-medium mb-2">
                상품 유형
              </label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="패키지 여행">패키지 여행</SelectItem>
                  <SelectItem value="자유여행">자유여행</SelectItem>
                  <SelectItem value="가족여행">가족여행</SelectItem>
                  <SelectItem value="신혼여행">신혼여행</SelectItem>
                  <SelectItem value="골프여행">골프여행</SelectItem>
                  <SelectItem value="미식여행">미식여행</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="additionalKeywords" className="block text-sm font-medium mb-2">
              추가 키워드
            </label>
            <Textarea
              id="additionalKeywords"
              placeholder="예: 골프, 온천, 쇼핑, 문화체험"
              value={additionalKeywords}
              onChange={(e) => setAdditionalKeywords(e.target.value)}
              rows={2}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="titleCount" className="block text-sm font-medium mb-2">
                생성할 제목 개수
              </label>
              <Select value={titleCount.toString()} onValueChange={(value) => setTitleCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3개</SelectItem>
                  <SelectItem value="5">5개</SelectItem>
                  <SelectItem value="10">10개</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                API 키 <span className="text-red-500">*</span>
              </label>
              <Select value={apiKeyId} onValueChange={(value) => {
                setApiKeyId(value);
                const selectedKey = apiKeys.find(key => key.id === value);
                if (selectedKey) {
                  setModelId(selectedKey.model_id);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="API 키를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {apiKeys.map((key) => (
                    <SelectItem key={key.id} value={key.id}>
                      {key.name} ({key.model_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium mb-2">
                창의성 (Temperature)
              </label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerateTitles} 
            disabled={isLoading || !location.trim() || !apiKeyId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                제목 생성 중...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                AI 제목 생성하기
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {titles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>생성된 제목들</CardTitle>
            <CardDescription>
              총 {titles.length}개의 SEO 최적화 제목이 생성되었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {titles.map((titleResult, index) => (
                <div
                  key={titleResult.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-lg mb-2">{titleResult.title}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {titleResult.keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        길이: {titleResult.title.length}자
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyTitle(titleResult.title)}
                      className="ml-4"
                    >
                      {copiedTitle === titleResult.title ? (
                        <>
                          <Check className="mr-1 h-3 w-3" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-3 w-3" />
                          복사
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}