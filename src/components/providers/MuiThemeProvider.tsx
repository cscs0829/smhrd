'use client'

import { ThemeProvider } from '@mui/material/styles'
import { createMuiTheme } from '@/lib/mui-theme'
import { useEffect, useState } from 'react'

interface MuiThemeProviderProps {
  children: React.ReactNode
}

export function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  const [theme, setTheme] = useState(() => createMuiTheme())

  useEffect(() => {
    // 클라이언트 사이드에서 테마 재생성
    setTheme(createMuiTheme())
  }, [])

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  )
}