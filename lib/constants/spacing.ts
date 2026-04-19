/**
 * Spacing Configuration
 * 
 * Centralized spacing values that map to Tailwind spacing scale.
 * Use these constants instead of hardcoded pixel values.
 * 
 * Usage:
 * - Import: `import { SPACING } from '@/lib/constants/spacing'`
 * - Use: `className={cn('p-4', SPACING.container.padding)}`
 * - Or: `style={{ padding: SPACING.values[4] }}` (only when Tailwind classes can't be used)
 */

// ============================================================================
// TAILWIND SPACING SCALE
// ============================================================================

/**
 * Tailwind spacing scale (matches globals.css @theme spacing variables)
 * Use these numeric keys with Tailwind classes: p-4, m-6, gap-3, etc.
 */
export const SPACING_SCALE = {
  0: 0,      // 0px
  0.5: 2,    // 2px
  1: 4,      // 4px
  1.5: 6,    // 6px
  2: 8,      // 8px
  2.5: 10,   // 10px
  3: 12,     // 12px
  3.5: 14,   // 14px
  4: 16,     // 16px
  5: 20,     // 20px
  6: 24,     // 24px
  7: 28,     // 28px
  8: 32,     // 32px
  9: 36,     // 36px
  10: 40,    // 40px
  11: 44,    // 44px
  12: 48,    // 48px
  14: 56,    // 56px
  16: 64,    // 64px
  20: 80,    // 80px
  24: 96,    // 96px
  28: 112,   // 112px
  32: 128,   // 128px
  36: 144,   // 144px
  40: 160,   // 160px
  44: 176,   // 176px
  48: 192,   // 192px
  52: 208,   // 208px
  56: 224,   // 224px
  60: 240,   // 240px
  64: 256,   // 256px
  72: 288,   // 288px
  80: 320,   // 320px
  96: 384,   // 384px
} as const

// ============================================================================
// SEMANTIC SPACING
// ============================================================================

/**
 * Semantic spacing names for common use cases.
 * These map to Tailwind spacing classes for consistency.
 */
export const SPACING = {
  // Container padding
  container: {
    padding: 'p-4',        // 16px - standard container padding
    paddingLg: 'p-6',      // 24px - large container padding
    paddingXl: 'p-8',      // 32px - extra large container padding
  },
  
  // Component spacing
  component: {
    gap: 'gap-4',          // 16px - standard gap between components
    gapSm: 'gap-3',        // 12px - small gap
    gapLg: 'gap-6',        // 24px - large gap
  },
  
  // Section spacing
  section: {
    spacing: 'space-y-6',  // 24px - between major sections
    spacingSm: 'space-y-4', // 16px - between related sections
    spacingLg: 'space-y-8', // 32px - between distinct sections
  },
  
  // List spacing
  list: {
    spacing: 'space-y-3',  // 12px - between list items
    spacingSm: 'space-y-2', // 8px - compact list
    spacingLg: 'space-y-4', // 16px - spacious list
  },
  
  // Card spacing
  card: {
    padding: 'p-4',        // 16px - standard card padding
    paddingSm: 'p-3',      // 12px - compact card
    paddingLg: 'p-6',      // 24px - spacious card
  },
  
  // Sidebar spacing
  sidebar: {
    padding: 'p-4',        // 16px - sidebar section padding
    gap: 'gap-3',          // 12px - gap between sidebar items
    width: 'w-[280px]',    // 280px - sidebar width
    widthCollapsed: 'w-16', // 64px - collapsed sidebar width
  },
  
  // Modal spacing
  modal: {
    padding: 'p-6',        // 24px - modal content padding
    gap: 'gap-4',          // 16px - gap between modal elements
  },
  
  // Form spacing
  form: {
    spacing: 'space-y-4',  // 16px - between form fields
    gap: 'gap-4',          // 16px - between form elements
  },
  
  // Button spacing
  button: {
    paddingSm: 'px-3 py-1.5',   // 12px x 6px - small button
    padding: 'px-4 py-2',       // 16px x 8px - standard button
    paddingLg: 'px-6 py-3',     // 24px x 12px - large button
    gap: 'gap-2',               // 8px - gap between icon and text
  },
  
  // Input spacing
  input: {
    padding: 'px-3 py-2',  // 12px x 8px - input padding
    gap: 'gap-2',          // 8px - gap between label and input
  },
} as const

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

/**
 * Layout-specific spacing values.
 * Use these for consistent layout spacing across the app.
 */
export const LAYOUT = {
  sidebar: {
    width: 320,            // px - sidebar width (increased from 280)
    widthCollapsed: 64,    // px - collapsed sidebar width
    padding: 16,           // px - sidebar padding (use p-4)
    gap: 12,               // px - gap between items (use gap-3)
  },
  
  chat: {
    maxWidth: 768,         // px - chat column max width
    maxWidthPx: 768,       // px - chat column max width (for inline styles)
    paddingMobile: 16,     // px - mobile padding (use p-4)
    paddingDesktop: 24,    // px - desktop padding (use p-6)
    messageSpacing: 24,    // px - spacing between messages (use space-y-6)
  },
  
  container: {
    maxWidth: 1920,        // px - container max width
  },
  
  header: {
    height: 64,            // px - header height (use h-16)
  },
  
  footer: {
    height: 48,            // px - footer height (use h-12)
  },
} as const

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get pixel value from Tailwind spacing scale
 * Use this only when you need the actual pixel value (e.g., for calculations)
 * 
 * @example
 * const padding = getSpacingValue(4) // returns 16
 */
export function getSpacingValue(scale: keyof typeof SPACING_SCALE): number {
  return SPACING_SCALE[scale]
}

/**
 * Get rem value from Tailwind spacing scale
 * Use this only when you need rem values for inline styles
 * 
 * @example
 * const padding = getSpacingRem(4) // returns '1rem'
 */
export function getSpacingRem(scale: keyof typeof SPACING_SCALE): string {
  return `${SPACING_SCALE[scale] / 16}rem`
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type SpacingScale = keyof typeof SPACING_SCALE
export type SpacingClass = typeof SPACING[keyof typeof SPACING][keyof typeof SPACING[keyof typeof SPACING]]

