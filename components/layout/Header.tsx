'use client'

/**
 * Header Component
 * 
 * Global navigation header with links to all main pages.
 * Implements Task 1.3: Configure Routing and Navigation
 */

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Home, 
  Users, 
  History, 
  Menu,
  X,
  Database
} from 'lucide-react'

import { Button } from '@/components/common/Button'
import { useUIStore } from '@/lib/store/ui'
import { springPresets } from '@/lib/constants/animations'
import { cn } from '@/lib/utils/cn'

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Agents',
    href: '/agents',
    icon: Users,
  },
  {
    name: 'Models',
    href: '/models',
    icon: Database,
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: History,
  },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const sidebarOpen = useUIStore(state => state.sidebarOpen)
  const setSidebarOpen = useUIStore(state => state.setSidebarOpen)
  const pageTitle = useUIStore(state => state.pageTitle)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Hide header on chat and session pages
  const shouldHideHeader = pathname.startsWith('/chat') || pathname.startsWith('/session')
  
  if (shouldHideHeader) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          {/* Centered Navigation */}
          <nav className="flex items-center gap-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  )}
                  role="link"
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={16} />
                  {item.name}
                </motion.a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={springPresets.default}
          className="lg:hidden border-t border-border-subtle bg-surface"
        >
          <nav className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-3 rounded-md text-left transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  )}
                  role="link"
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </motion.a>
              )
            })}
          </nav>
        </motion.div>
      )}
    </header>
  )
}