/**
 * Liquid Glass Gradient System
 * Colorful gradient backgrounds for liquid glass effects
 */

export const gradients = {
  light: {
    // Main background - subtle warm gradient
    background:
      'linear-gradient(135deg, #FEFCE8 0%, #FEF9E7 50%, #FFEDD5 100%)',

    // Surface gradient - cream to peach
    surface: 'linear-gradient(135deg, #FEFCE8 0%, #FED7AA 100%)',

    // Card gradient - amber glow
    card: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',

    // Modal gradient - vibrant amber to orange
    modal: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #F97316 100%)',

    // Accent gradient - orange to coral
    accent: 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)',

    // Button gradient - warm amber
    button: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  },

  dark: {
    // Main background - deep blue-black gradient
    background:
      'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',

    // Surface gradient - slate to blue
    surface: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',

    // Card gradient - blue to purple
    card: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #60A5FA 100%)',

    // Modal gradient - vibrant blue to cyan
    modal: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #22D3EE 100%)',

    // Accent gradient - cyan to teal
    accent: 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 50%, #2DD4BF 100%)',

    // Button gradient - cool blue
    button: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
  },
} as const

/**
 * Mesh gradients for complex backgrounds
 */
export const meshGradients = {
  light: {
    // Planning card background
    planning: `
      radial-gradient(at 0% 0%, rgba(254, 243, 199, 0.8) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(253, 186, 116, 0.6) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(251, 146, 60, 0.5) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(254, 215, 170, 0.7) 0px, transparent 50%),
      #FEFCE8
    `,

    // Modal backdrop
    modal: `
      radial-gradient(at 20% 30%, rgba(251, 191, 36, 0.4) 0px, transparent 40%),
      radial-gradient(at 80% 70%, rgba(249, 115, 22, 0.3) 0px, transparent 40%),
      radial-gradient(at 50% 50%, rgba(252, 211, 77, 0.2) 0px, transparent 60%),
      #FEF9E7
    `,
  },

  dark: {
    // Planning card background
    planning: `
      radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.6) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.5) 0px, transparent 50%),
      radial-gradient(at 100% 100%, rgba(96, 165, 250, 0.4) 0px, transparent 50%),
      radial-gradient(at 0% 100%, rgba(30, 41, 59, 0.7) 0px, transparent 50%),
      #0F172A
    `,

    // Modal backdrop
    modal: `
      radial-gradient(at 20% 30%, rgba(14, 165, 233, 0.4) 0px, transparent 40%),
      radial-gradient(at 80% 70%, rgba(6, 182, 212, 0.3) 0px, transparent 40%),
      radial-gradient(at 50% 50%, rgba(34, 211, 238, 0.2) 0px, transparent 60%),
      #1E293B
    `,
  },
} as const

/**
 * Animated gradient keyframes
 */
export const animatedGradientKeyframes = {
  rotate: {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  shift: {
    '0%, 100%': { backgroundPosition: '0% 0%' },
    '50%': { backgroundPosition: '100% 100%' },
  },
} as const
