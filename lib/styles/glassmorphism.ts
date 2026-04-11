/**
 * Glassmorphism Design System
 * 
 * A complete design system for creating frosted glass effects
 * with backdrop blur, transparency, and subtle borders.
 */

export const glassStyles = {
  // Base glass effect - most common
  base: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  },
  
  // Light glass - more transparent
  light: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.05)',
  },
  
  // Medium glass - balanced
  medium: {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
  },
  
  // Strong glass - more opaque
  strong: {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.2)',
  },
  
  // Dark glass - for dark backgrounds
  dark: {
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
  
  // Colored glass variants
  blue: {
    background: 'rgba(59, 130, 246, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.2)',
  },
  
  purple: {
    background: 'rgba(168, 85, 247, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(168, 85, 247, 0.2)',
  },
  
  green: {
    background: 'rgba(34, 197, 94, 0.15)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(34, 197, 94, 0.2)',
  },
  
  // Selected state - more prominent
  selected: {
    background: 'rgba(59, 130, 246, 0.25)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    boxShadow: '0 12px 40px 0 rgba(59, 130, 246, 0.3)',
  },
  
  // Hover state - subtle enhancement
  hover: {
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(14px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 10px 36px 0 rgba(0, 0, 0, 0.15)',
  },
} as const

/**
 * Convert glass style object to CSS string
 */
export function glassToCSS(style: typeof glassStyles[keyof typeof glassStyles]): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value};`
    })
    .join(' ')
}

/**
 * Tailwind-compatible glass classes
 */
export const glassTailwind = {
  base: 'bg-white/10 backdrop-blur-[10px] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
  light: 'bg-white/5 backdrop-blur-[8px] border border-white/15 shadow-[0_4px_16px_0_rgba(0,0,0,0.05)]',
  medium: 'bg-white/15 backdrop-blur-[12px] border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)]',
  strong: 'bg-white/25 backdrop-blur-[16px] border border-white/30 shadow-[0_12px_40px_0_rgba(0,0,0,0.2)]',
  dark: 'bg-black/20 backdrop-blur-[10px] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]',
  blue: 'bg-blue-500/15 backdrop-blur-[12px] border border-blue-500/30 shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]',
  purple: 'bg-purple-500/15 backdrop-blur-[12px] border border-purple-500/30 shadow-[0_8px_32px_0_rgba(168,85,247,0.2)]',
  green: 'bg-green-500/15 backdrop-blur-[12px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.2)]',
  selected: 'bg-blue-500/25 backdrop-blur-[16px] border border-blue-500/40 shadow-[0_12px_40px_0_rgba(59,130,246,0.3)]',
  hover: 'bg-white/20 backdrop-blur-[14px] border border-white/30 shadow-[0_10px_36px_0_rgba(0,0,0,0.15)]',
} as const

/**
 * Glass card component props
 */
export interface GlassCardProps {
  variant?: keyof typeof glassStyles
  className?: string
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}

/**
 * Animation variants for glass components
 */
export const glassAnimations = {
  fadeIn: {
    initial: { opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)' },
    animate: { opacity: 1, scale: 1, backdropFilter: 'blur(12px)' },
    exit: { opacity: 0, scale: 0.95, backdropFilter: 'blur(0px)' },
  },
  
  slideUp: {
    initial: { opacity: 0, y: 20, backdropFilter: 'blur(0px)' },
    animate: { opacity: 1, y: 0, backdropFilter: 'blur(12px)' },
    exit: { opacity: 0, y: -20, backdropFilter: 'blur(0px)' },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.8, backdropFilter: 'blur(0px)' },
    animate: { opacity: 1, scale: 1, backdropFilter: 'blur(12px)' },
    exit: { opacity: 0, scale: 0.8, backdropFilter: 'blur(0px)' },
  },
} as const

/**
 * Text colors that work well on glass backgrounds
 */
export const glassTextColors = {
  primary: 'text-white',
  secondary: 'text-white/80',
  muted: 'text-white/60',
  accent: 'text-blue-200',
  success: 'text-green-200',
  warning: 'text-yellow-200',
  error: 'text-red-200',
} as const
