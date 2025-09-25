"use client"

import React, { useState } from 'react'
import { DatabaseStatus } from '@/components/features/DatabaseStatus'
import { DuplicateSearch } from '@/components/features/DuplicateSearch'
import { KeywordTitleGenerator } from '@/components/features/KeywordTitleGenerator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ApiKeyManager } from '@/components/features/ApiKeyManager'
import ClickDataProcessor from '@/components/features/ClickDataProcessor'
import { EPDataProcessor } from '@/components/features/EPDataProcessor'
import { ImageLinkGenerator } from '@/components/features/ImageLinkGenerator'
import { ThemeToggle } from '@/components/features/ThemeToggle'
import { Database } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('process')
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState<number>(0)

  const handleFileSelect = () => {
    // 파일 선택 처리 (현재는 사용하지 않음)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // 데이터베이스 탭이 활성화되면 자동으로 새로고침
    if (value === 'database') {
      setDbRefreshTrigger(prev => prev + 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-background">
      {/* 상단 헤더 영역 */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 dark:bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4">
          {/* 로고 */}
          <div className="flex items-center space-x-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
              <Database className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                EP 데이터 관리
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">
                데이터 처리 및 분석 플랫폼
              </span>
            </div>
          </div>

          {/* 오른쪽 액션 버튼들 */}
          <div className="flex items-center space-x-2 ml-auto">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              v2.0
            </Badge>
            
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Tabs defaultValue="process" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-muted text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] flex flex-wrap gap-1 w-full sm:w-auto">
            <TabsTrigger 
              value="process"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              클릭수 데이터 처리
            </TabsTrigger>
            <TabsTrigger 
              value="ep-data"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              EP데이터 처리
            </TabsTrigger>
            <TabsTrigger 
              value="duplicate"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              중복 검색기
            </TabsTrigger>
            <TabsTrigger 
              value="image-links"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              이미지 링크
            </TabsTrigger>
            <TabsTrigger 
              value="keywords"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              키워드 제목
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              설정
            </TabsTrigger>
            <TabsTrigger 
              value="database"
              className="flex-1 min-w-0 px-3 py-1 text-xs sm:text-sm"
            >
              데이터베이스
            </TabsTrigger>
          </TabsList>

          <TabsContent value="process" className="space-y-4">
            <ClickDataProcessor 
              onFileSelect={handleFileSelect}
            />
          </TabsContent>

          <TabsContent value="ep-data" className="space-y-4">
            <EPDataProcessor 
              onFileSelect={handleFileSelect}
            />
          </TabsContent>

          <TabsContent value="duplicate">
            <DuplicateSearch />
          </TabsContent>

          <TabsContent value="image-links">
            <ImageLinkGenerator />
          </TabsContent>

          <TabsContent value="keywords">
            <KeywordTitleGenerator />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>설정</CardTitle>
              </CardHeader>
              <CardContent>
                <ApiKeyManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database">
            <DatabaseStatus onRefresh={dbRefreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
