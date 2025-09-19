"use client"

import React, { useState } from 'react'
import { FileUpload } from '@/components/features/FileUpload'
import { ProcessButton } from '@/components/features/ProcessButton'
import { AIModelSelector } from '@/components/features/AIModelSelector'
import { AttachModal } from '@/components/features/AttachModal'
import { DatabaseStatus } from '@/components/features/DatabaseStatus'
import { DuplicateSearch } from '@/components/features/DuplicateSearch'
import { KeywordTitleGenerator } from '@/components/features/KeywordTitleGenerator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { downloadFile, processFile } from '@/lib/api'
import { getRecommendedModel } from '@/lib/ai-models'
import { ApiKeyManager } from '@/components/features/ApiKeyManager'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; downloadUrl?: string } | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>(getRecommendedModel().id)
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<number>(0)
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(100)
  const [activeTab, setActiveTab] = useState<string>('process')
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState<number>(0)

  const handleFileSelect = (f: File) => {
    setFile(f)
    setResult(null)
  }

  const handleProcess = async () => {
    if (!file) return
    try {
      setIsProcessing(true)
      setResult(null)
      const res = await processFile(file)
      setResult(res)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '처리 중 오류가 발생했습니다'
      setResult({ success: false, message })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (result?.downloadUrl) {
      downloadFile(result.downloadUrl, '처리결과.xlsx')
    }
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
        <TabsList className="grid grid-cols-5 w-full sm:w-auto">
          <TabsTrigger value="process">처리</TabsTrigger>
          <TabsTrigger value="duplicate">중복 검색기</TabsTrigger>
          <TabsTrigger value="keywords">키워드 제목</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
          <TabsTrigger value="database">데이터베이스</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <AttachModal onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              <ProcessButton 
                onProcess={handleProcess}
                onDownload={handleDownload}
                isProcessing={isProcessing}
                hasFile={!!file}
                result={result}
              />
            </div>

            <div className="w-full md:w-[380px]">
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
            </div>
          </div>
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
