'use client'

import React from 'react'
import Link from 'next/link'
import { Database, Github, Heart, Code } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center space-y-6">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Link href="/" className="flex items-center justify-center space-x-3 group mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                <Database className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">
                  EP 데이터 관리
                </span>
                <span className="text-sm text-muted-foreground">
                  개인 프로젝트
                </span>
              </div>
            </Link>
            
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              CSV 파일을 통한 EP 데이터 자동 처리 및 관리 도구
            </p>
            
            <div className="flex items-center justify-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Heart className="mr-1 h-3 w-3 text-red-500" />
                개인 프로젝트
              </Badge>
              <Badge variant="secondary" className="text-xs">
                v2.0.0
              </Badge>
            </div>
          </motion.div>

          <Separator className="w-full max-w-md" />

          {/* Bottom Footer */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© 2024 개인 프로젝트</span>
              <span>•</span>
              <span>Made with Next.js</span>
            </div>

            {/* GitHub Link */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="https://github.com/cscs0829"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>@cscs0829</span>
              </Link>
            </motion.div>

            {/* Tech Stack */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Code className="h-3 w-3" />
              <span>Next.js • Tailwind CSS • shadcn/ui • Supabase</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}