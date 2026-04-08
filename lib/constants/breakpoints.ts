/**
 * Responsive Breakpoints
 * 
 * Mobile-first breakpoint system for responsive design.
 * Follows the design philosophy of progressive enhancement.
 */

export const breakpoints = {
  // Mobile devices
  mobile: {
    sm: '320px',   // Small phones (iPhone SE)
    md: '375px',   // Standard phones (iPhone 12/13)
    lg: '414px',   // Large phones (iPhone 12 Pro Max)
  },
  
  // Tablets
  tablet: {
    sm: '768px',   // iPad Mini, small tablets
    md: '834px',   // iPad Air
    lg: '1024px',  // iPad Pro 11"
  },
  
  // Desktop
  desktop: {
    sm: '1280px',  // Small laptops
    md: '1440px',  // Standard desktop
    lg: '1920px',  // Large desktop
    xl: '2560px',  // 4K displays
  },
} as const

// Tailwind-style breakpoint system
export const screens = {
  'xs': '320px',    // Extra small phones
  'sm': '640px',    // Small devices
  'md': '768px',    // Tablets
  'lg': '1024px',   // Small laptops
  'xl': '1280px',   // Desktop
  '2xl': '1536px',  // Large desktop
} as const

// Media query helpers
export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.tablet.sm})`,
  tablet: `(min-width: ${breakpoints.tablet.sm}) and (max-width: ${breakpoints.tablet.lg})`,
  desktop: `(min-width: ${breakpoints.tablet.lg})`,
  
  // Pointer type
  touch: '(pointer: coarse)',
  mouse: '(pointer: fine)',
  
  // Accessibility
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkMode: '(prefers-color-scheme: dark)',
} as const

export type Breakpoint = keyof typeof screens
