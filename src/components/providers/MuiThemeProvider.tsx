'use client'

import { ThemeProvider } from '@mui/material/styles'
import { createMuiTheme } from '@/lib/mui-theme'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

interface MuiThemeProviderProps {
  children: React.ReactNode
}

export function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  const { resolvedTheme } = useTheme()
  const [theme, setTheme] = useState(() => createMuiTheme())

  useEffect(() => {
    // 테마가 변경될 때마다 MUI 테마 재생성
    setTheme(createMuiTheme(resolvedTheme as 'light' | 'dark'))
  }, [resolvedTheme])

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}