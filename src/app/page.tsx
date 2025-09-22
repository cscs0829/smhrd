"use client"

import React, { useState } from 'react'
import { DatabaseStatus } from '@/components/features/DatabaseStatus'
import { DuplicateSearch } from '@/components/features/DuplicateSearch'
import { KeywordTitleGenerator } from '@/components/features/KeywordTitleGenerator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApiKeyManager } from '@/components/features/ApiKeyManager'
import { ClickDataProcessor } from '@/components/features/ClickDataProcessor'
import { EPDataProcessorNew } from '@/components/features/EPDataProcessorNew'

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('process')
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState<number>(0)

  const handleFileSelect = (_f: File) => {
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
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Tabs defaultValue="process" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-6 w-full sm:w-auto">
          <TabsTrigger value="process">클릭수 데이터 처리</TabsTrigger>
          <TabsTrigger value="ep-data">EP데이터 처리</TabsTrigger>
          <TabsTrigger value="duplicate">중복 검색기</TabsTrigger>
          <TabsTrigger value="keywords">키워드 제목</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
          <TabsTrigger value="database">데이터베이스</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          <ClickDataProcessor 
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />
              </TabsContent>

              <TabsContent value="ep-data" className="space-y-4">
                <EPDataProcessorNew 
                  onFileSelect={handleFileSelect}
                  isProcessing={isProcessing}
                />
              </TabsContent>

              <TabsContent value="duplicate">
                <DuplicateSearch />
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
  );
}
