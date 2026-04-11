'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'style'> {
  /**
   * Glass intensity variant
   * - light: Very transparent, minimal blur
   * - medium: Balanced transparency and blur (default)
   * - strong: More opaque, stronger blur
   */
  variant?: 'light' | 'medium' | 'strong'
  
  /**
   * Blur amount (overrides variant blur)
   */
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  /**
   * Border style
   */
  border?: 'subtle' | 'normal' | 'strong' | 'none'
  
  /**
   * Enable hover effect
   */
  hoverable?: boolean
  
  /**
   * Custom background color (overrides variant)
   */
  bgColor?: string
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Children elements
   */
  children: React.ReactNode
  
  /**
   * Custom inline styles
   */
  customStyle?: React.CSSProperties
}

const variantStyles = {
  light: 'bg-white/5',
  medium: 'bg-white/10',
  strong: 'bg-white/20',
}

const blurStyles = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
}

const borderStyles = {
  subtle: 'border border-white/10',
  normal: 'border border-white/20',
  strong: 'border border-white/30',
  none: '',
}

export function GlassCard({
  variant = 'medium',
  blur = 'lg',
  border = 'normal',
  hoverable = false,
  bgColor,
  className,
  children,
  customStyle,
  ...motionProps
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        // Base glass styles
        'rounded-xl',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]',
        
        // Variant background
        !bgColor && variantStyles[variant],
        
        // Blur
        blurStyles[blur],
        
        // Border
        borderStyles[border],
        
        // Hover effect
        hoverable && 'transition-all duration-300 hover:bg-white/15 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)]',
        
        // Custom classes
        className
      )}
      style={{
        ...(bgColor && { background: bgColor }),
        ...customStyle,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

/**
 * Colored glass card variants
 */
export function BlueGlassCard({ className, ...props }: Omit<GlassCardProps, 'bgColor'>) {
  return (
    <GlassCard
      bgColor="rgba(59, 130, 246, 0.15)"
      className={cn('border-blue-500/30 shadow-[0_8px_32px_0_rgba(59,130,246,0.2)]', className)}
      {...props}
    />
  )
}

export function PurpleGlassCard({ className, ...props }: Omit<GlassCardProps, 'bgColor'>) {
  return (
    <GlassCard
      bgColor="rgba(168, 85, 247, 0.15)"
      className={cn('border-purple-500/30 shadow-[0_8px_32px_0_rgba(168,85,247,0.2)]', className)}
      {...props}
    />
  )
}

export function GreenGlassCard({ className, ...props }: Omit<GlassCardProps, 'bgColor'>) {
  return (
    <GlassCard
      bgColor="rgba(34, 197, 94, 0.15)"
      className={cn('border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.2)]', className)}
      {...props}
    />
  )
}

/**
 * Glass button component
 */
export function GlassButton({
  className,
  children,
  ...props
}: Omit<GlassCardProps, 'variant' | 'blur'>) {
  return (
    <GlassCard
      variant="medium"
      blur="md"
      hoverable
      className={cn(
        'px-6 py-3 cursor-pointer',
        'hover:scale-[1.02] active:scale-[0.98]',
        'transition-transform duration-200',
        className
      )}
      {...props}
    >
      {children}
    </GlassCard>
  )
}
