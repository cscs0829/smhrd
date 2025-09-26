import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/mui-pagination-fix.css";
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/sonner'
import { ApiKeyProvider } from '@/contexts/ApiKeyContext'
import { ThemeProvider } from 'next-themes'
import { MuiThemeProviderWrapper } from '@/components/providers/MuiThemeProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EP 자동 삭제 및 추가 시스템",
  description: "CSV 업로드로 0클릭 상품 자동 삭제/추가 및 제목 생성",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-background text-foreground">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MuiThemeProviderWrapper>
            <ApiKeyProvider>
              <main className="flex-1 bg-background dark:bg-background">
                {children}
              </main>
              <Footer />
              <Toaster richColors position="top-right" />
            </ApiKeyProvider>
          </MuiThemeProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
