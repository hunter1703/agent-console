/**
 * Performance Monitoring Utilities
 * 
 * Utilities for measuring and monitoring web performance metrics.
 * Tracks Core Web Vitals and custom performance metrics.
 */

// ============================================================================
// Core Web Vitals
// ============================================================================

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

/**
 * Get rating for a metric based on thresholds
 */
function getRating(value: number, goodThreshold: number, poorThreshold: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= goodThreshold) return 'good'
  if (value <= poorThreshold) return 'needs-improvement'
  return 'poor'
}

/**
 * Measure First Contentful Paint (FCP)
 * Good: < 1.8s, Needs Improvement: < 3s, Poor: >= 3s
 */
export function measureFCP(): Promise<PerformanceMetric | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(null)
      return
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        
        if (fcpEntry) {
          const value = fcpEntry.startTime
          resolve({
            name: 'FCP',
            value,
            rating: getRating(value, 1800, 3000),
            timestamp: Date.now(),
          })
          observer.disconnect()
        }
      })

      observer.observe({ entryTypes: ['paint'] })

      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect()
        resolve(null)
      }, 10000)
    } catch (error) {
      console.error('Error measuring FCP:', error)
      resolve(null)
    }
  })
}

/**
 * Measure Largest Contentful Paint (LCP)
 * Good: < 2.5s, Needs Improvement: < 4s, Poor: >= 4s
 */
export function measureLCP(): Promise<PerformanceMetric | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(null)
      return
    }

    try {
      let lcpValue = 0

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        if (lastEntry) {
          lcpValue = lastEntry.renderTime || lastEntry.loadTime
        }
      })

      observer.observe({ entryTypes: ['largest-contentful-paint'] })

      // Report LCP after page is fully loaded
      window.addEventListener('load', () => {
        setTimeout(() => {
          observer.disconnect()
          if (lcpValue > 0) {
            resolve({
              name: 'LCP',
              value: lcpValue,
              rating: getRating(lcpValue, 2500, 4000),
              timestamp: Date.now(),
            })
          } else {
            resolve(null)
          }
        }, 0)
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect()
        if (lcpValue > 0) {
          resolve({
            name: 'LCP',
            value: lcpValue,
            rating: getRating(lcpValue, 2500, 4000),
            timestamp: Date.now(),
          })
        } else {
          resolve(null)
        }
      }, 10000)
    } catch (error) {
      console.error('Error measuring LCP:', error)
      resolve(null)
    }
  })
}

/**
 * Measure Cumulative Layout Shift (CLS)
 * Good: < 0.1, Needs Improvement: < 0.25, Poor: >= 0.25
 */
export function measureCLS(): Promise<PerformanceMetric | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(null)
      return
    }

    try {
      let clsValue = 0

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
      })

      observer.observe({ entryTypes: ['layout-shift'] })

      // Report CLS after page is fully loaded
      window.addEventListener('load', () => {
        setTimeout(() => {
          observer.disconnect()
          resolve({
            name: 'CLS',
            value: clsValue,
            rating: getRating(clsValue, 0.1, 0.25),
            timestamp: Date.now(),
          })
        }, 0)
      })

      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect()
        resolve({
          name: 'CLS',
          value: clsValue,
          rating: getRating(clsValue, 0.1, 0.25),
          timestamp: Date.now(),
        })
      }, 10000)
    } catch (error) {
      console.error('Error measuring CLS:', error)
      resolve(null)
    }
  })
}

/**
 * Measure Time to Interactive (TTI)
 * Approximated using Time to First Byte + DOM Content Loaded
 */
export function measureTTI(): PerformanceMetric | null {
  if (typeof window === 'undefined' || !window.performance) {
    return null
  }

  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (!navigation) return null

    const tti = navigation.domInteractive
    
    return {
      name: 'TTI',
      value: tti,
      rating: getRating(tti, 3800, 7300),
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error measuring TTI:', error)
    return null
  }
}

/**
 * Measure First Input Delay (FID)
 * Good: < 100ms, Needs Improvement: < 300ms, Poor: >= 300ms
 */
export function measureFID(): Promise<PerformanceMetric | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(null)
      return
    }

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstInput = entries[0] as any
        
        if (firstInput) {
          const value = firstInput.processingStart - firstInput.startTime
          resolve({
            name: 'FID',
            value,
            rating: getRating(value, 100, 300),
            timestamp: Date.now(),
          })
          observer.disconnect()
        }
      })

      observer.observe({ entryTypes: ['first-input'] })

      // Timeout after 30 seconds (user might not interact)
      setTimeout(() => {
        observer.disconnect()
        resolve(null)
      }, 30000)
    } catch (error) {
      console.error('Error measuring FID:', error)
      resolve(null)
    }
  })
}

// ============================================================================
// Custom Performance Metrics
// ============================================================================

/**
 * Measure component render time
 */
export function measureComponentRender(componentName: string, fn: () => void): number {
  const start = performance.now()
  fn()
  const end = performance.now()
  const duration = end - start

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`)
  }

  return duration
}

/**
 * Measure async operation time
 */
export async function measureAsync<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  const duration = end - start

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${operationName} completed in ${duration.toFixed(2)}ms`)
  }

  return { result, duration }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

/**
 * Collect all Core Web Vitals
 */
export async function collectWebVitals(): Promise<PerformanceMetric[]> {
  const metrics: PerformanceMetric[] = []

  const [fcp, lcp, cls, fid] = await Promise.all([
    measureFCP(),
    measureLCP(),
    measureCLS(),
    measureFID(),
  ])

  const tti = measureTTI()

  if (fcp) metrics.push(fcp)
  if (lcp) metrics.push(lcp)
  if (cls) metrics.push(cls)
  if (fid) metrics.push(fid)
  if (tti) metrics.push(tti)

  return metrics
}

/**
 * Log performance metrics to console
 */
export function logPerformanceMetrics(metrics: PerformanceMetric[]): void {
  console.group('📊 Performance Metrics')
  
  metrics.forEach(metric => {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌'
    const unit = metric.name === 'CLS' ? '' : 'ms'
    console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}${unit} (${metric.rating})`)
  })
  
  console.groupEnd()
}

/**
 * Send performance metrics to analytics
 */
export function sendPerformanceMetrics(metrics: PerformanceMetric[]): void {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics, PostHog, etc.
    // analytics.track('performance_metrics', { metrics })
  }
}

// ============================================================================
// React Hook for Performance Monitoring
// ============================================================================

import { useEffect } from 'react'

/**
 * Hook to monitor page performance
 * Automatically collects and logs Core Web Vitals on page load
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const collectMetrics = async () => {
      const metrics = await collectWebVitals()
      logPerformanceMetrics(metrics)
      sendPerformanceMetrics(metrics)
    }

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      collectMetrics()
    } else {
      window.addEventListener('load', collectMetrics)
      return () => window.removeEventListener('load', collectMetrics)
    }
  }, [])
}

// ============================================================================
// Bundle Size Utilities
// ============================================================================

/**
 * Log bundle size information
 */
export function logBundleSize(): void {
  if (typeof window === 'undefined' || !window.performance) return

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  let totalSize = 0
  const sizeByType: Record<string, number> = {}

  resources.forEach(resource => {
    const size = resource.transferSize || 0
    totalSize += size

    const type = resource.initiatorType || 'other'
    sizeByType[type] = (sizeByType[type] || 0) + size
  })

  console.group('📦 Bundle Size')
  console.log(`Total: ${(totalSize / 1024).toFixed(2)} KB`)
  
  Object.entries(sizeByType)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, size]) => {
      console.log(`${type}: ${(size / 1024).toFixed(2)} KB`)
    })
  
  console.groupEnd()
}
