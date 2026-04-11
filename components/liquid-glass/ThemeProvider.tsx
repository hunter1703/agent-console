'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { type Theme, type ThemeName, themes, generateThemeCSS } from '@/lib/liquid-glass/theme'

// ============================================================================
// CONTEXT
// ============================================================================

interface ThemeContextValue {
  theme: Theme
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

// ============================================================================
// PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  storageKey = 'liquid-glass-theme',
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme)
  
  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored && stored in themes) {
        setThemeName(stored as ThemeName)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
  }, [storageKey])
  
  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, themeName)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [themeName, storageKey])
  
  // Inject theme CSS variables
  useEffect(() => {
    const theme = themes[themeName]
    const css = generateThemeCSS(theme)
    
    // Create or update style element
    let styleEl = document.getElementById('liquid-glass-theme')
    
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'liquid-glass-theme'
      document.head.appendChild(styleEl)
    }
    
    styleEl.textContent = css
    
    return () => {
      styleEl?.remove()
    }
  }, [themeName])
  
  const theme = useMemo(() => themes[themeName], [themeName])
  
  const setTheme = (name: ThemeName) => {
    setThemeName(name)
  }
  
  const toggleTheme = () => {
    setThemeName(current => {
      if (current === 'light') return 'dark'
      if (current === 'dark') return 'default'
      return 'light'
    })
  }
  
  const value = useMemo(
    () => ({
      theme,
      themeName,
      setTheme,
      toggleTheme,
    }),
    [theme, themeName]
  )
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  
  return context
}

/**
 * Hook to get current theme colors
 */
export function useThemeColors() {
  const { theme } = useTheme()
  return theme.colors
}

/**
 * Hook to get current theme spacing
 */
export function useThemeSpacing() {
  const { theme } = useTheme()
  return theme.spacing
}

/**
 * Hook to get current theme radius
 */
export function useThemeRadius() {
  const { theme } = useTheme()
  return theme.radius
}

/**
 * Hook to get current theme shadows
 */
export function useThemeShadows() {
  const { theme } = useTheme()
  return theme.shadows
}

/**
 * Hook to get component configuration from theme
 */
export function useComponentConfig<K extends keyof Theme['components']>(
  component: K
) {
  const { theme } = useTheme()
  return theme.components[component]
}
