'use client'

/**
 * Theme Provider
 * 
 * Provides theme management using next-themes.
 * Supports light and dark modes with smooth transitions.
 * 
 * Design Philosophy:
 * - Respect system preferences
 * - Persist user choice
 * - Smooth theme transitions
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}
