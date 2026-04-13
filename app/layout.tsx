import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { UIProvider } from '@/components/providers/UIProvider'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { SkipLinks } from '@/components/common/SkipLinks'
import { Header } from '@/components/layout/Header'
import { FloatingThemeToggle } from '@/components/layout/FloatingThemeToggle'

export const metadata: Metadata = {
  title: 'Agent Console',
  description: 'Modern, animated, user-friendly interface for AI agents',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <SkipLinks />
        <ThemeProvider>
          <QueryProvider>
            <ErrorBoundary>
              <UIProvider>
                <div className="min-h-screen bg-background flex flex-col">
                  <Header />
                  <main id="main-content" className="flex-1 overflow-hidden">
                    {children}
                  </main>
                  <FloatingThemeToggle />
                </div>
              </UIProvider>
            </ErrorBoundary>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
