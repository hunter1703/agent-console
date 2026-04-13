'use client'

/**
 * Animated Counter Component
 * 
 * Counts up from 0 (or previous value) to target value with smooth animation.
 * Perfect for statistics, metrics, and dynamic numbers.
 * 
 * Design Philosophy:
 * - Smooth, natural counting animation
 * - Supports decimals and formatting
 * - Respects prefers-reduced-motion
 * - Lightweight and performant
 */

import { useEffect, useState } from 'react'
import { useCountUp } from '@/lib/hooks/useCountUp'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  separator?: string
}

export function AnimatedCounter({
  value,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  separator = ',',
}: AnimatedCounterProps) {
  const count = useCountUp(value, duration)

  // Format number with separators
  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals)
    const parts = fixed.split('.')
    
    // Add thousand separators
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)
    
    return parts.join('.')
  }

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}

/**
 * Animated Percentage
 * Pre-configured counter for percentages
 */
export function AnimatedPercentage({
  value,
  duration = 800,
  className = '',
}: {
  value: number
  duration?: number
  className?: string
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      decimals={0}
      suffix="%"
      className={className}
    />
  )
}

/**
 * Animated Currency
 * Pre-configured counter for currency
 */
export function AnimatedCurrency({
  value,
  duration = 800,
  currency = '$',
  className = '',
}: {
  value: number
  duration?: number
  currency?: string
  className?: string
}) {
  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      decimals={2}
      prefix={currency}
      className={className}
    />
  )
}
