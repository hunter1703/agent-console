'use client'

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Glass } from '@/components/liquid-glass/Glass'
import { glassBuilder } from '@/lib/liquid-glass/builder'
import { cn } from '@/lib/utils/cn'

// ============================================================================
// TYPES
// ============================================================================

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /**
   * Toggle variant
   */
  variant?: 'default' | 'liquid'
  
  /**
   * Checked state
   */
  checked?: boolean
  
  /**
   * Change handler
   */
  onCheckedChange?: (checked: boolean) => void
  
  /**
   * Size
   */
  size?: 'sm' | 'md' | 'lg'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Toggle - Binary toggle switch with liquid morph
 * 
 * Features:
 * - Liquid morph animation between states
 * - Glass surface
 * - Spring physics
 * - Accessible
 * 
 * @example
 * ```tsx
 * <Toggle 
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 * 
 * <Toggle 
 *   variant="liquid"
 *   checked={enabled}
 *   onCheckedChange={setEnabled}
 * />
 * ```
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      variant = 'default',
      checked = false,
      onCheckedChange,
      size = 'md',
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }
    
    // Size configurations
    const sizes = {
      sm: { width: 36, height: 20, thumbSize: 16, padding: 2 },
      md: { width: 44, height: 24, thumbSize: 20, padding: 2 },
      lg: { width: 52, height: 28, thumbSize: 24, padding: 2 },
    }
    
    const { width, height, thumbSize, padding } = sizes[size]
    
    // Build configuration for track
    const trackConfig = React.useMemo(() => {
      return glassBuilder()
        .preset('frosted', 'light')
        .fill(checked ? 'hsla(var(--color-primary-hue), var(--color-primary-saturation), var(--color-primary-lightness), 0.3)' : 'rgba(255, 255, 255, 0.1)')
        .radius(9999)
        .withTransition(300, 'spring')
        .accessible()
        .optimized()
        .build()
    }, [checked])
    
    // Thumb position
    const thumbX = checked ? width - thumbSize - padding * 2 : 0
    
    return (
      <Glass
        ref={ref as any}
        as="button"
        role="switch"
        aria-checked={checked}
        config={trackConfig}
        // @ts-expect-error - GlassProps extends HTMLMotionProps<'div'> which doesn't perfectly match button props
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center',
          'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all',
          className
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          padding: `${padding}px`,
        }}
        {...props}
      >
        {/* Thumb */}
        <motion.div
          className={cn(
            'rounded-full bg-white shadow-lg',
            variant === 'liquid' && 'filter-goo'
          )}
          style={{
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
          }}
          animate={{
            x: thumbX,
            scale: checked ? 1 : 0.9,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
        
        {/* SVG Filter for liquid effect */}
        {variant === 'liquid' && (
          <svg width="0" height="0" className="absolute">
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>
          </svg>
        )}
      </Glass>
    )
  }
)

Toggle.displayName = 'Toggle'

// ============================================================================
// SEGMENTED BUTTON
// ============================================================================

export interface SegmentedButtonProps {
  /**
   * Options to display
   */
  options: Array<{
    value: string
    label: string
    icon?: React.ReactNode
  }>
  
  /**
   * Selected value(s)
   */
  value: string | string[]
  
  /**
   * Change handler
   */
  onChange: (value: string | string[]) => void
  
  /**
   * Allow multiple selection
   */
  multiple?: boolean
  
  /**
   * Size
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Full width
   */
  fullWidth?: boolean
  
  /**
   * Additional class name
   */
  className?: string
}

/**
 * SegmentedButton - Multi-option toggle
 * 
 * @example
 * ```tsx
 * <SegmentedButton
 *   options={[
 *     { value: 'agents', label: 'My Agents' },
 *     { value: 'chats', label: 'Recent Chats' },
 *   ]}
 *   value={view}
 *   onChange={setView}
 * />
 * ```
 */
export const SegmentedButton = forwardRef<HTMLDivElement, SegmentedButtonProps>(
  (
    {
      options,
      value,
      onChange,
      multiple = false,
      size = 'md',
      fullWidth = false,
      className,
    },
    ref
  ) => {
    const isSelected = (optionValue: string) => {
      if (Array.isArray(value)) {
        return value.includes(optionValue)
      }
      return value === optionValue
    }
    
    const handleClick = (optionValue: string) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [value]
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter(v => v !== optionValue)
          : [...currentValues, optionValue]
        onChange(newValues)
      } else {
        onChange(optionValue)
      }
    }
    
    // Size styles
    const sizeStyles = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
    }
    
    // Container config
    const containerConfig = glassBuilder()
      .preset('frosted', 'light')
      .fill('rgba(255, 255, 255, 0.05)')
      .radius(12)
      .padding('0.25rem')
      .build()
    
    return (
      <Glass
        ref={ref as any}
        config={containerConfig}
        className={cn(
          'inline-flex gap-1',
          fullWidth && 'w-full',
          className
        )}
      >
        {options.map((option) => {
          const selected = isSelected(option.value)
          
          return (
            <motion.button
              key={option.value}
              onClick={() => handleClick(option.value)}
              className={cn(
                'relative flex items-center justify-center gap-2',
                'font-medium transition-all',
                'rounded-lg cursor-pointer',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
                sizeStyles[size],
                fullWidth && 'flex-1',
                selected
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_rgba(0,0,0,0.1)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
              whileTap={{ scale: 0.98 }}
            >
              {option.icon && (
                <span className="inline-flex">{option.icon}</span>
              )}
              {option.label}
            </motion.button>
          )
        })}
      </Glass>
    )
  }
)

SegmentedButton.displayName = 'SegmentedButton'
