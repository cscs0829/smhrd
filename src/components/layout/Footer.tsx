'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Database, Github, Heart, Code, Linkedin, Instagram, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'

interface SystemStatus {
  database: {
    status: boolean
    message: string
  }
  aiService: {
    status: boolean
    message: string
  }
  fileProcessing: {
    status: boolean
    message: string
  }
}

export function Footer() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('/api/system-status')
        const data = await response.json()
        if (data.success) {
          setSystemStatus(data.system)
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-3 w-3 text-green-500" />
    ) : (
      <XCircle className="h-3 w-3 text-red-500" />
    )
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600'
  }

  return (
    <footer className="border-t bg-background dark:bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center space-y-4 sm:space-y-6">
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
              <span>© 2025 EP 자동 삭제 및 추가 시스템. All rights reserved. made by sean.</span>
              <span>•</span>
              <span>Made with Next.js</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
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
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="https://www.linkedin.com/in/changseon-park-20594b275/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="https://www.instagram.com/seon1999.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </Link>
              </motion.div>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Code className="h-3 w-3" />
                <span>Next.js • Tailwind CSS • shadcn/ui • Supabase • Framer Motion</span>
              </div>
              
              {/* System Status */}
              {!isLoading && systemStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-wrap items-center justify-center gap-4 text-xs"
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(systemStatus.database.status)}
                    <span className={getStatusColor(systemStatus.database.status)}>
                      DB: {systemStatus.database.message}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(systemStatus.aiService.status)}
                    <span className={getStatusColor(systemStatus.aiService.status)}>
                      AI: {systemStatus.aiService.message}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(systemStatus.fileProcessing.status)}
                    <span className={getStatusColor(systemStatus.fileProcessing.status)}>
                      파일: {systemStatus.fileProcessing.message}
                    </span>
                  </div>
                </motion.div>
              )}
              
              {isLoading && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 animate-pulse" />
                  <span>시스템 상태 확인 중...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}