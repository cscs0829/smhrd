'use client'

import React from 'react'
import Link from 'next/link'
import { Database, Github, Mail, Twitter, Linkedin, Heart, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  product: [
    { name: '데이터 관리', href: '/', prefetch: false },
    { name: '분석 도구', href: '#', prefetch: false },
    { name: 'API 문서', href: '#', prefetch: false },
    { name: '가격 정책', href: '#', prefetch: false },
  ],
  company: [
    { name: '회사 소개', href: '#', prefetch: false },
    { name: '블로그', href: '#', prefetch: false },
    { name: '채용', href: '#', prefetch: false },
    { name: '연락처', href: '#', prefetch: false },
  ],
  resources: [
    { name: '도움말', href: '#', prefetch: false },
    { name: '문서', href: '#', prefetch: false },
    { name: '커뮤니티', href: '#', prefetch: false },
    { name: '상태', href: '#', prefetch: false },
  ],
  legal: [
    { name: '개인정보처리방침', href: '#', prefetch: false },
    { name: '이용약관', href: '#', prefetch: false },
    { name: '쿠키 정책', href: '#', prefetch: false },
    { name: '라이선스', href: '#', prefetch: false },
  ],
}

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { name: 'Email', href: 'mailto:contact@example.com', icon: Mail },
]

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 group mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                <Database className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight">
                  EP 데이터 관리
                </span>
                <span className="text-sm text-muted-foreground">
                  데이터 처리 및 분석 플랫폼
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              강력하고 직관적인 데이터 관리 도구로 비즈니스 인사이트를 발견하세요. 
              고급 분석 기능과 실시간 처리로 데이터의 가치를 극대화합니다.
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Heart className="mr-1 h-3 w-3 text-red-500" />
                Made with Love
              </Badge>
              <Badge variant="secondary" className="text-xs">
                v2.0.0
              </Badge>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">제품</h3>
                   <ul className="space-y-3">
                     {footerLinks.product.map((link) => (
                       <li key={link.name}>
                         <Link
                           href={link.href}
                           prefetch={link.prefetch}
                           className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center group"
                         >
                           {link.name}
                           <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </Link>
                       </li>
                     ))}
                   </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">회사</h3>
                   <ul className="space-y-3">
                     {footerLinks.company.map((link) => (
                       <li key={link.name}>
                         <Link
                           href={link.href}
                           prefetch={link.prefetch}
                           className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center group"
                         >
                           {link.name}
                           <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </Link>
                       </li>
                     ))}
                   </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">리소스</h3>
                   <ul className="space-y-3">
                     {footerLinks.resources.map((link) => (
                       <li key={link.name}>
                         <Link
                           href={link.href}
                           prefetch={link.prefetch}
                           className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center group"
                         >
                           {link.name}
                           <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </Link>
                       </li>
                     ))}
                   </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">법적 고지</h3>
                   <ul className="space-y-3">
                     {footerLinks.legal.map((link) => (
                       <li key={link.name}>
                         <Link
                           href={link.href}
                           prefetch={link.prefetch}
                           className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center group"
                         >
                           {link.name}
                           <ExternalLink className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                         </Link>
                       </li>
                     ))}
                   </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-4">
            <p className="text-sm text-muted-foreground">
              © 2024 EP 데이터 관리. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>서울, 대한민국</span>
              <span>•</span>
              <span>한국어</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-2">
            {socialLinks.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="icon"
                asChild
                className="h-9 w-9"
              >
                <Link
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            이 서비스는 Next.js, Tailwind CSS, shadcn/ui로 구축되었습니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
