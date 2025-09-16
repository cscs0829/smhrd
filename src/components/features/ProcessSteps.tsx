'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowRight } from 'lucide-react'

interface ProcessStepsProps {
  currentStep: number
}

const steps = [
  {
    id: 1,
    title: 'CSV 파일 업로드',
    description: '클릭수 데이터가 포함된 CSV 파일을 업로드합니다',
    icon: '📁'
  },
  {
    id: 2,
    title: '0클릭 상품 식별',
    description: '클릭수가 0인 상품 ID들을 자동으로 식별합니다',
    icon: '🔍'
  },
  {
    id: 3,
    title: '데이터 백업',
    description: '삭제할 상품을 백업 테이블에 안전하게 저장합니다',
    icon: '💾'
  },
  {
    id: 4,
    title: '상품 삭제',
    description: '메인 테이블에서 0클릭 상품들을 삭제합니다',
    icon: '🗑️'
  },
  {
    id: 5,
    title: '새 상품 생성',
    description: '새로운 ID, 이미지, GPT 제목으로 상품을 재생성합니다',
    icon: '✨'
  },
  {
    id: 6,
    title: '엑셀 내보내기',
    description: '처리 결과를 엑셀 파일로 다운로드합니다',
    icon: '📊'
  }
]

export function ProcessSteps({ currentStep }: ProcessStepsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          처리 과정
        </CardTitle>
        <CardDescription>
          시스템이 자동으로 수행하는 단계별 처리 과정입니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isPending = step.id > currentStep

            return (
              <div key={step.id} className="flex items-start gap-4">
                {/* 단계 번호 및 아이콘 */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isCompleted 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : isCurrent
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-2 ${
                      isCompleted 
                        ? 'bg-green-200 dark:bg-green-800' 
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>

                {/* 단계 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium ${
                      isCurrent 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        진행 중
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        완료
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isPending 
                      ? 'text-gray-400 dark:text-gray-500' 
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {/* 현재 단계 표시 */}
                {isCurrent && (
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <ArrowRight className="h-4 w-4 animate-pulse" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

