'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HelpCircle, FileText, Database, Cpu, AlertTriangle } from 'lucide-react'

export function HelpModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="mr-2 h-4 w-4" />
          도움말
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            사용 가이드
          </DialogTitle>
          <DialogDescription>
            EP 자동 삭제 및 추가 시스템 사용 방법을 안내합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 개요 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                시스템 개요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                이 시스템은 클릭수가 0인 상품을 자동으로 삭제하고, 새로운 상품을 생성하여 
                데이터베이스를 최적화하는 도구입니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">주요 기능</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• 0클릭 상품 자동 식별</li>
                    <li>• 안전한 데이터 백업</li>
                    <li>• 새로운 상품 자동 생성</li>
                    <li>• GPT 기반 제목 생성</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">지원 형식</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• CSV 파일 (.csv)</li>
                    <li>• 최대 10MB</li>
                    <li>• UTF-8 인코딩</li>
                    <li>• 필수 컬럼 포함</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 사용 방법 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                사용 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'CSV 파일 준비',
                    description: '상품별_YYYYMMDD_YYYYMMDD.csv 형식의 파일을 준비합니다',
                    details: [
                      '필수 컬럼: 상품ID, 상품명, 클릭수',
                      '클릭수 컬럼에 0인 상품들이 처리 대상입니다',
                      '파일 크기는 10MB 이하로 제한됩니다'
                    ]
                  },
                  {
                    step: 2,
                    title: '파일 업로드',
                    description: '드래그 앤 드롭 또는 클릭으로 CSV 파일을 업로드합니다',
                    details: [
                      'CSV 파일만 업로드 가능합니다',
                      '업로드 후 파일 정보가 표시됩니다',
                      '잘못된 형식의 파일은 거부됩니다'
                    ]
                  },
                  {
                    step: 3,
                    title: '처리 실행',
                    description: '"데이터 처리 시작" 버튼을 클릭하여 자동 처리를 시작합니다',
                    details: [
                      '처리 중에는 다른 작업을 할 수 없습니다',
                      '진행 상황이 실시간으로 표시됩니다',
                      '처리 시간은 데이터 양에 따라 달라집니다'
                    ]
                  },
                  {
                    step: 4,
                    title: '결과 다운로드',
                    description: '처리 완료 후 엑셀 파일을 다운로드합니다',
                    details: [
                      '새로 생성된 상품 데이터가 포함됩니다',
                      '중복 제목은 빨간색으로 표시됩니다',
                      '원본 데이터와 비교할 수 있습니다'
                    ]
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-300">
                      {item.step}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        {item.details.map((detail, index) => (
                          <li key={index}>• {detail}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 주의사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                주의사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">데이터 백업</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      삭제되는 모든 상품은 자동으로 백업 테이블에 저장됩니다. 
                      필요시 복구가 가능합니다.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">처리 시간</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      대량의 데이터 처리 시 시간이 오래 걸릴 수 있습니다. 
                      처리 중에는 페이지를 닫지 마세요.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">제목 중복</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      GPT로 생성된 제목이 기존 제목과 중복될 수 있습니다. 
                      엑셀 파일에서 빨간색으로 표시된 항목을 확인하세요.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 기술 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                기술 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">사용 기술</h4>
                  <div className="flex flex-wrap gap-1">
                    {['Next.js', 'Supabase', 'OpenAI GPT', 'LangChain', 'Tailwind CSS'].map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">지원 브라우저</h4>
                  <div className="flex flex-wrap gap-1">
                    {['Chrome', 'Firefox', 'Safari', 'Edge'].map((browser) => (
                      <Badge key={browser} variant="outline" className="text-xs">
                        {browser}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
