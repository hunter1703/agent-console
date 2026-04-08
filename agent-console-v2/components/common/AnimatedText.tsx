'use client'

/**
 * Animated Text Component
 * 
 * Character-by-character text reveal with serif/sans font switching on hover.
 * Inspired by unseen.co navigation animations.
 * 
 * Design Philosophy:
 * - Delightful character-by-character reveals
 * - Serif/sans font switching for emphasis
 * - Smooth spring physics
 * - Stagger timing for organic feel
 */

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { springPresets } from '@/lib/constants/animations'

export interface AnimatedTextProps {
  text: string
  className?: string
  stagger?: number // Delay between characters (seconds)
  once?: boolean // Animate only once
  hoverFontSwitch?: boolean // Switch to serif on hover
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export function AnimatedText({
  text,
  className,
  stagger = 0.05,
  once = true,
  hoverFontSwitch = false,
  as: Component = 'span',
}: AnimatedTextProps) {
  const ref = useRef<HTMLElement | null>(null)
  const isInView = useInView(ref, { once, amount: 0.5 })
  const [isHovered, setIsHovered] = useState(false)

  // Split text into characters, preserving spaces
  const characters = text.split('')

  return (
    <Component
      ref={ref as any}
      className={cn('inline-block overflow-hidden', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className={cn(
            'inline-block',
            hoverFontSwitch && isHovered && 'font-serif italic'
          )}
          initial={{ opacity: 0, y: 50 }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: 50,
                }
          }
          transition={{
            ...springPresets.snappy,
            delay: index * stagger,
          }}
          style={{
            // Preserve spaces
            whiteSpace: char === ' ' ? 'pre' : 'normal',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </Component>
  )
}

/**
 * Animated Heading Component
 * 
 * Pre-configured heading with animated text reveal.
 */
export interface AnimatedHeadingProps extends Omit<AnimatedTextProps, 'as'> {
  level: 1 | 2 | 3 | 4 | 5 | 6
}

export function AnimatedHeading({
  level,
  text,
  className,
  ...props
}: AnimatedHeadingProps) {
  const Component = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

  const headingStyles = {
    1: 'text-4xl font-bold',
    2: 'text-2xl font-semibold',
    3: 'text-xl font-semibold',
    4: 'text-lg font-medium',
    5: 'text-base font-medium',
    6: 'text-sm font-medium',
  }

  return (
    <AnimatedText
      as={Component}
      text={text}
      className={cn(headingStyles[level], className)}
      {...props}
    />
  )
}

/**
 * Animated Link Component
 * 
 * Link with character-by-character animation and serif font switch on hover.
 */
export interface AnimatedLinkProps extends AnimatedTextProps {
  href?: string
  onClick?: () => void
}

export function AnimatedLink({
  text,
  href,
  onClick,
  className,
  ...props
}: AnimatedLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        'inline-block cursor-pointer transition-colors',
        'hover:text-primary',
        className
      )}
    >
      <AnimatedText
        text={text}
        hoverFontSwitch={true}
        {...props}
      />
    </a>
  )
}
