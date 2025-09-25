import KeywordTitleGenerator from '@/components/features/KeywordTitleGenerator';
import ClickDataProcessor from '@/components/features/ClickDataProcessor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              EP 데이터 관리 시스템
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              AI 제목 생성 및 데이터 처리 도구
            </p>
          </div>
          
          <Tabs defaultValue="title-generator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="title-generator">AI 제목 생성기</TabsTrigger>
              <TabsTrigger value="data-processor">데이터 처리</TabsTrigger>
            </TabsList>
            
            <TabsContent value="title-generator" className="mt-6">
              <KeywordTitleGenerator />
            </TabsContent>
            
            <TabsContent value="data-processor" className="mt-6">
              <ClickDataProcessor />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
