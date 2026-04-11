'use client'

import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function Link({ href, children, className = '' }: LinkProps) {
  const isExternal = href.startsWith('http://') || href.startsWith('https://')
  
  return (
    <motion.a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={`
        inline-flex items-center gap-1
        text-primary
        hover:underline
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        transition-colors
        ${className}
      `}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {children}
      {isExternal && (
        <ExternalLink size={12} className="inline-block" />
      )}
    </motion.a>
  )
}
