'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Database, BarChart3, Settings, HelpCircle, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/features/ThemeToggle'

const navigationItems = [
  {
    title: '데이터 관리',
    href: '/',
    icon: Database,
    description: 'EP 데이터 업로드 및 관리'
  },
  {
    title: '분석 도구',
    href: '/analytics',
    icon: BarChart3,
    description: '데이터 분석 및 통계'
  },
  {
    title: '설정',
    href: '/settings',
    icon: Settings,
    description: '시스템 설정 및 구성'
  }
]

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center space-x-3 group" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <Database className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">
              EP 데이터 관리
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              데이터 처리 및 분석 플랫폼
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            v2.0
          </Badge>
          
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">도움말</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">메뉴 토글</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">버전</span>
                <Badge variant="secondary">v2.0</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
