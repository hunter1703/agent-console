/**
 * Design Token System
 * 
 * Complete design tokens for the Agent Console including colors, typography,
 * spacing, shadows, and other design primitives. Follows the design philosophy
 * of restrained elegance with warm light and cool dark themes.
 */

// ============================================================================
// COLOR SYSTEM
// ============================================================================

export const lightTheme = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#FEFCE8',
  surfaceHover: '#FEF9E7',
  surfaceElevated: '#FEF3C7',
  
  // Text
  text: {
    primary: '#1C1917',
    secondary: '#78716C',
    tertiary: '#A8A29E',
    inverse: '#FAFAFA',
  },
  
  // Accents
  primary: '#F59E0B',
  primaryHover: '#D97706',
  primaryLight: '#FEF3C7',
  primaryGlow: 'rgba(245, 158, 11, 0.2)',
  
  secondary: '#F97316',
  secondaryLight: '#FFEDD5',
  
  // Borders
  border: {
    subtle: '#F5F5F4',
    medium: '#E7E5E4',
    strong: '#D6D3D1',
    accent: '#F59E0B',
  },
  
  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Special Effects
  gradient: {
    primary: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
    subtle: 'linear-gradient(135deg, #FEFCE8 0%, #FEF9E7 100%)',
    glow: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
  },
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.1)',
  glass: 'rgba(255, 255, 255, 0.8)',
} as const

export const darkTheme = {
  // Backgrounds
  background: '#09090B',
  surface: '#18181B',
  surfaceHover: '#27272A',
  surfaceElevated: '#1F1F23',
  
  // Text
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    inverse: '#09090B',
  },
  
  // Accents
  primary: '#FAFAFA',
  primaryHover: '#E4E4E7',
  primaryLight: '#27272A',
  primaryGlow: 'rgba(250, 250, 250, 0.1)',
  
  secondary: '#60A5FA',
  secondaryLight: '#1E3A5F',
  
  // Borders
  border: {
    subtle: '#27272A',
    medium: '#3F3F46',
    strong: '#52525B',
    accent: '#FAFAFA',
  },
  
  // Semantic
  success: '#10B981',
  successLight: '#064E3B',
  error: '#EF4444',
  errorLight: '#7F1D1D',
  warning: '#F59E0B',
  warningLight: '#78350F',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  
  // Special Effects
  gradient: {
    primary: 'linear-gradient(135deg, #FAFAFA 0%, #E4E4E7 100%)',
    subtle: 'linear-gradient(135deg, #18181B 0%, #27272A 100%)',
    glow: 'radial-gradient(circle, rgba(250, 250, 250, 0.08) 0%, transparent 70%)',
  },
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.3)',
  glass: 'rgba(24, 24, 27, 0.8)',
} as const

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
  },
  
  // Font Sizes (px)
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    lg: '17px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
  
  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.01em',
  },
} as const

// ============================================================================
// SPACING SYSTEM
// ============================================================================

/**
 * @deprecated Use SPACING from '@/lib/constants/spacing' instead
 * This is kept for backward compatibility only
 */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px',
} as const

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const

// ============================================================================
// LAYOUT
// ============================================================================

/**
 * @deprecated Use LAYOUT from '@/lib/constants/spacing' instead
 * This is kept for backward compatibility only
 */
export const layout = {
  // Sidebar
  sidebar: {
    width: '280px',
    widthCollapsed: '64px',
    padding: '12px',
    gap: '8px',
  },
  
  // Chat Interface
  chat: {
    maxWidth: '768px',
    padding: {
      mobile: '16px',
      desktop: '24px',
    },
    messageSpacing: '24px',
  },
  
  // Container
  container: {
    maxWidth: '1920px',
    margin: '0 auto',
  },
} as const

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Theme = typeof lightTheme
export type ThemeKey = 'light' | 'dark'
