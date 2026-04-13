'use client'

/**
 * Skip Links Component
 * 
 * Provides keyboard navigation shortcuts to skip to main content areas.
 * Essential for screen reader users and keyboard navigation.
 * 
 * Accessibility:
 * - Hidden by default with sr-only
 * - Visible on keyboard focus
 * - Positioned at top of page
 * - High contrast styling
 */

import { cn } from '@/lib/utils'

interface SkipLink {
  href: string
  label: string
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#sidebar', label: 'Skip to sidebar' },
]

interface SkipLinksProps {
  links?: SkipLink[]
  className?: string
}

export function SkipLinks({ links = defaultLinks, className }: SkipLinksProps) {
  return (
    <div className={cn('skip-links', className)}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
