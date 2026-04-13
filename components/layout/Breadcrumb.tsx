'use client'

/**
 * Breadcrumb Component
 * 
 * Dynamic breadcrumb navigation based on current route.
 * Implements Task 1.3: Configure Routing and Navigation
 */

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import { springPresets } from '@/lib/constants/animations'
import { cn } from '@/lib/utils/cn'

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

export function Breadcrumb() {
  const pathname = usePathname()
  const router = useRouter()

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Always start with Dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard',
      isActive: segments.length === 0 || (segments.length === 1 && segments[0] === 'dashboard'),
    })

    // Handle different routes
    if (segments.length > 0) {
      const [firstSegment, secondSegment, thirdSegment] = segments

      switch (firstSegment) {
        case 'dashboard':
          // Already handled above
          break

        case 'chat':
          breadcrumbs.push({
            label: 'Chat',
            href: '/chat',
            isActive: segments.length === 1,
          })
          
          if (secondSegment) {
            breadcrumbs.push({
              label: `Agent ${secondSegment}`,
              isActive: true,
            })
          }
          break

        case 'agents':
          breadcrumbs.push({
            label: 'Agents',
            href: '/agents',
            isActive: segments.length === 1,
          })
          
          if (secondSegment === 'new') {
            breadcrumbs.push({
              label: 'Create Agent',
              isActive: true,
            })
          } else if (secondSegment) {
            breadcrumbs.push({
              label: `Agent ${secondSegment}`,
              href: `/agents/${secondSegment}`,
              isActive: segments.length === 2,
            })
            
            if (thirdSegment === 'edit') {
              breadcrumbs.push({
                label: 'Edit',
                isActive: true,
              })
            }
          }
          break

        case 'sessions':
          breadcrumbs.push({
            label: 'Sessions',
            href: '/sessions',
            isActive: segments.length === 1,
          })
          
          if (secondSegment) {
            breadcrumbs.push({
              label: `Session ${secondSegment}`,
              isActive: true,
            })
          }
          break

        default:
          // Handle unknown routes
          breadcrumbs.push({
            label: firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1),
            isActive: true,
          })
          break
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Don't show breadcrumbs if we're only on dashboard
  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav 
      className="flex items-center space-x-2 text-sm text-text-secondary mb-6"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight 
                size={14} 
                className="mx-2 text-text-tertiary" 
                aria-hidden="true"
              />
            )}
            
            {item.href && !item.isActive ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(item.href!)}
                className={cn(
                  'hover:text-text-primary transition-colors',
                  index === 0 && 'flex items-center gap-1'
                )}
              >
                {index === 0 && <Home size={14} />}
                {item.label}
              </motion.button>
            ) : (
              <span 
                className={cn(
                  'flex items-center gap-1',
                  item.isActive ? 'text-text-primary font-medium' : 'text-text-secondary'
                )}
                aria-current={item.isActive ? 'page' : undefined}
              >
                {index === 0 && <Home size={14} />}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}