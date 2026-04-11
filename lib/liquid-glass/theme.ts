/**
 * Liquid Glass Theme System
 * 
 * Centralized theme configuration for consistent glass components
 */

import type { GlassConfig } from './framework'
import { glassBuilder } from './builder'

// ============================================================================
// THEME TYPES
// ============================================================================

export interface ThemeColors {
  // Primary palette
  primary: {
    hue: number
    saturation: number
    lightness: number
  }
  
  // Secondary palette
  secondary: {
    hue: number
    saturation: number
    lightness: number
  }
  
  // Accent palette
  accent: {
    hue: number
    saturation: number
    lightness: number
  }
  
  // Semantic colors
  success: string
  warning: string
  error: string
  info: string
  
  // Glass colors
  glass: {
    light: string
    medium: string
    heavy: string
    border: string
    shadow: string
  }
  
  // Text colors
  text: {
    primary: string
    secondary: string
    tertiary: string
    inverse: string
  }
  
  // Background colors
  background: {
    base: string
    elevated: string
    overlay: string
  }
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

export interface ThemeRadius {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  full: string
}

export interface ThemeShadows {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

export interface ThemeBreakpoints {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

export interface Theme {
  name: string
  colors: ThemeColors
  spacing: ThemeSpacing
  radius: ThemeRadius
  shadows: ThemeShadows
  breakpoints: ThemeBreakpoints
  
  // Component-specific configurations
  components: {
    button: GlassConfig
    card: GlassConfig
    modal: GlassConfig
    input: GlassConfig
    nav: GlassConfig
    sidebar: GlassConfig
    tooltip: GlassConfig
    badge: GlassConfig
  }
}

// ============================================================================
// DEFAULT THEME
// ============================================================================

export const defaultTheme: Theme = {
  name: 'default',
  
  colors: {
    primary: {
      hue: 220,
      saturation: 90,
      lightness: 60,
    },
    
    secondary: {
      hue: 280,
      saturation: 80,
      lightness: 65,
    },
    
    accent: {
      hue: 45,
      saturation: 90,
      lightness: 60,
    },
    
    success: 'hsl(142, 76%, 36%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(199, 89%, 48%)',
    
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.1)',
      heavy: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.18)',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
    
    text: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.8)',
      tertiary: 'rgba(255, 255, 255, 0.6)',
      inverse: 'rgba(0, 0, 0, 0.9)',
    },
    
    background: {
      base: 'linear-gradient(-70deg, #202020, #000000)',
      elevated: 'rgba(255, 255, 255, 0.05)',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  radius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },
  
  components: {
    button: glassBuilder()
      .preset('frosted', 'light')
      .padding('0.875rem 2rem')
      .radius(12)
      .shadow('soft')
      .withHover('lift', 'medium')
      .withTransition(200, 'spring')
      .accessible()
      .optimized()
      .build(),
    
    card: glassBuilder()
      .preset('frosted', 'medium')
      .padding('2rem')
      .radius(16)
      .shadow('medium')
      .withHover('lift', 'subtle')
      .accessible()
      .optimized()
      .build(),
    
    modal: glassBuilder()
      .preset('frosted', 'heavy')
      .padding('2rem')
      .radius(20)
      .shadow('hard')
      .accessible()
      .optimized()
      .build(),
    
    input: glassBuilder()
      .preset('clear', 'default')
      .padding('0.875rem 1rem')
      .radius(12)
      .shadow('soft')
      .withHover('glow', 'subtle')
      .accessible()
      .optimized()
      .build(),
    
    nav: glassBuilder()
      .preset('frosted', 'medium')
      .padding('1rem 2rem')
      .radius(0)
      .shadow('medium')
      .accessible()
      .optimized()
      .build(),
    
    sidebar: glassBuilder()
      .preset('frosted', 'heavy')
      .fill('rgba(0, 0, 0, 0.65)')
      .padding('1rem')
      .radius(0)
      .shadow('hard')
      .accessible()
      .optimized()
      .build(),
    
    tooltip: glassBuilder()
      .preset('frosted', 'medium')
      .padding('0.5rem 0.75rem')
      .radius(8)
      .shadow('soft')
      .withTransition(150, 'ease-out')
      .accessible()
      .optimized()
      .build(),
    
    badge: glassBuilder()
      .preset('frosted', 'light')
      .padding('0.25rem 0.75rem')
      .radius(12)
      .shadow('soft')
      .accessible()
      .optimized()
      .build(),
  },
}

// ============================================================================
// DARK THEME
// ============================================================================

export const darkTheme: Theme = {
  ...defaultTheme,
  name: 'dark',
  
  colors: {
    ...defaultTheme.colors,
    
    glass: {
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      heavy: 'rgba(0, 0, 0, 0.7)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.3)',
    },
    
    background: {
      base: 'linear-gradient(-70deg, #0a0a0a, #000000)',
      elevated: 'rgba(255, 255, 255, 0.03)',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
}

// ============================================================================
// LIGHT THEME
// ============================================================================

export const lightTheme: Theme = {
  ...defaultTheme,
  name: 'light',
  
  colors: {
    ...defaultTheme.colors,
    
    glass: {
      light: 'rgba(255, 255, 255, 0.5)',
      medium: 'rgba(255, 255, 255, 0.7)',
      heavy: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(0, 0, 0, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.05)',
    },
    
    text: {
      primary: 'rgba(0, 0, 0, 0.95)',
      secondary: 'rgba(0, 0, 0, 0.8)',
      tertiary: 'rgba(0, 0, 0, 0.6)',
      inverse: 'rgba(255, 255, 255, 0.95)',
    },
    
    background: {
      base: 'linear-gradient(-70deg, #f5f5f5, #ffffff)',
      elevated: 'rgba(0, 0, 0, 0.03)',
      overlay: 'rgba(255, 255, 255, 0.7)',
    },
  },
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Get HSL color string from theme color
 */
export function getHSL(
  color: { hue: number; saturation: number; lightness: number },
  alpha?: number
): string {
  const { hue, saturation, lightness } = color
  
  if (alpha !== undefined) {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
  }
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // Handle rgba
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${opacity})`)
  }
  
  // Handle rgb
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
  }
  
  // Handle hsl
  if (color.startsWith('hsl')) {
    return color.replace('hsl', 'hsla').replace(')', `, ${opacity})`)
  }
  
  // Handle hex
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  
  return color
}

/**
 * Generate CSS custom properties from theme
 */
export function generateThemeCSS(theme: Theme): string {
  const { colors, spacing, radius, shadows } = theme
  
  return `
    :root {
      /* Colors */
      --color-primary-hue: ${colors.primary.hue};
      --color-primary-saturation: ${colors.primary.saturation}%;
      --color-primary-lightness: ${colors.primary.lightness}%;
      --color-primary: hsl(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness));
      
      --color-secondary-hue: ${colors.secondary.hue};
      --color-secondary-saturation: ${colors.secondary.saturation}%;
      --color-secondary-lightness: ${colors.secondary.lightness}%;
      --color-secondary: hsl(var(--color-secondary-hue), var(--color-secondary-saturation), var(--color-secondary-lightness));
      
      --color-accent-hue: ${colors.accent.hue};
      --color-accent-saturation: ${colors.accent.saturation}%;
      --color-accent-lightness: ${colors.accent.lightness}%;
      --color-accent: hsl(var(--color-accent-hue), var(--color-accent-saturation), var(--color-accent-lightness));
      
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
      --color-info: ${colors.info};
      
      --glass-light: ${colors.glass.light};
      --glass-medium: ${colors.glass.medium};
      --glass-heavy: ${colors.glass.heavy};
      --glass-border: ${colors.glass.border};
      --glass-shadow: ${colors.glass.shadow};
      
      --text-primary: ${colors.text.primary};
      --text-secondary: ${colors.text.secondary};
      --text-tertiary: ${colors.text.tertiary};
      --text-inverse: ${colors.text.inverse};
      
      --bg-base: ${colors.background.base};
      --bg-elevated: ${colors.background.elevated};
      --bg-overlay: ${colors.background.overlay};
      
      /* Spacing */
      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};
      --spacing-2xl: ${spacing['2xl']};
      --spacing-3xl: ${spacing['3xl']};
      
      /* Radius */
      --radius-sm: ${radius.sm};
      --radius-md: ${radius.md};
      --radius-lg: ${radius.lg};
      --radius-xl: ${radius.xl};
      --radius-2xl: ${radius['2xl']};
      --radius-full: ${radius.full};
      
      /* Shadows */
      --shadow-sm: ${shadows.sm};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};
      --shadow-xl: ${shadows.xl};
      --shadow-2xl: ${shadows['2xl']};
      --shadow-inner: ${shadows.inner};
    }
  `.trim()
}

/**
 * Create a custom theme by extending a base theme
 */
export function createTheme(
  name: string,
  base: Theme = defaultTheme,
  overrides: Partial<Theme> = {}
): Theme {
  return {
    ...base,
    ...overrides,
    name,
    colors: { ...base.colors, ...overrides.colors },
    spacing: { ...base.spacing, ...overrides.spacing },
    radius: { ...base.radius, ...overrides.radius },
    shadows: { ...base.shadows, ...overrides.shadows },
    breakpoints: { ...base.breakpoints, ...overrides.breakpoints },
    components: { ...base.components, ...overrides.components },
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const themes = {
  default: defaultTheme,
  dark: darkTheme,
  light: lightTheme,
}

export type ThemeName = keyof typeof themes
