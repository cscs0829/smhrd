'use client'

// Card 컴포넌트는 사용되지 않음
import { Badge } from '@/components/ui/badge'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 시스템 정보 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              시스템 정보
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>데이터베이스 연결 정상</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>AI 서비스 활성화</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span>파일 처리 준비 완료</span>
              </div>
            </div>
          </div>

          {/* 기술 스택 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              기술 스택
            </h3>
            <div className="flex flex-wrap gap-1">
              {[
                'Next.js 15',
                'Supabase',
                'OpenAI GPT',
                'LangChain',
                'Tailwind CSS',
                'TypeScript'
              ].map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* 링크 및 정보 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              링크 및 정보
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Github className="h-4 w-4" />
                <a 
                  href="#" 
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  GitHub 저장소
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 EP 자동 삭제 및 추가 시스템. All rights reserved. made by sean.</p>
            <div className="flex items-center gap-4">
              <span>버전 1.0.0</span>
              <span>•</span>
              <span>최종 업데이트: 2025-01-16</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
