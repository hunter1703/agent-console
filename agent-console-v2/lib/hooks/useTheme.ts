/**
 * useTheme Hook
 * 
 * Manages theme state with liquid transitions and meta tag updates.
 */

'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect } from 'react'

export function useTheme() {
  const { theme, setTheme: setNextTheme, systemTheme } = useNextTheme()

  const currentTheme = theme === 'system' ? systemTheme : theme

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    // Trigger theme transition animation
    document.documentElement.classList.add('theme-transitioning')
    
    setNextTheme(newTheme)

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 600)
  }

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Update meta theme-color tag
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const color = currentTheme === 'dark' ? '#09090B' : '#FFFFFF'
      metaThemeColor.setAttribute('content', color)
    }
  }, [currentTheme])

  return {
    theme: currentTheme as 'light' | 'dark' | undefined,
    setTheme,
    toggleTheme,
  }
}
