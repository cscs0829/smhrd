'use client'

import { HelpModal } from '@/components/features/HelpModal'
import { ThemeToggle } from '@/components/features/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Settings } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 및 제목 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                EP 자동 삭제 및 추가 시스템
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                클릭수 0인 상품 자동 처리 도구
              </p>
            </div>
          </div>

          {/* 상태 표시 및 액션 버튼들 */}
          <div className="flex items-center gap-3">
            {/* 시스템 상태 */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                시스템 정상
              </span>
            </div>

            {/* 버전 정보 */}
            <Badge variant="outline" className="hidden md:inline-flex">
              v1.0.0
            </Badge>

            {/* 테마 토글 */}
            <ThemeToggle />

            {/* 도움말 버튼 */}
            <HelpModal />

            {/* 설정 버튼 (향후 확장용) */}
            <Button variant="ghost" size="sm" disabled>
              <Settings className="h-4 w-4" />
              <span className="sr-only">설정</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
