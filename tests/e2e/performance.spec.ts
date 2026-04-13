/**
 * Performance E2E Tests
 * 
 * Tests application performance including load times,
 * Core Web Vitals, and resource optimization.
 */

import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    
    // Wait for main content to be visible
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    
    const loadTime = Date.now() - startTime
    
    // Should load within 3 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(3000)
    
    console.log(`Dashboard load time: ${loadTime}ms`)
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {}
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          vitals.lcp = lastEntry.startTime
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        // First Input Delay (FID) - can't measure without real user interaction
        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          vitals.cls = clsValue
        }).observe({ entryTypes: ['layout-shift'] })
        
        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          vitals.fcp = entries[0].startTime
        }).observe({ entryTypes: ['paint'] })
        
        // Resolve after a short delay to collect metrics
        setTimeout(() => resolve(vitals), 2000)
      })
    })
    
    console.log('Core Web Vitals:', vitals)
    
    // LCP should be under 2.5s (good threshold)
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500)
    }
    
    // CLS should be under 0.1 (good threshold)
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1)
    }
    
    // FCP should be under 1.8s (good threshold)
    if (vitals.fcp) {
      expect(vitals.fcp).toBeLessThan(1800)
    }
  })

  test('should load resources efficiently', async ({ page }) => {
    // Monitor network requests
    const requests = []
    
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      })
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Analyze requests
    const jsRequests = requests.filter(r => r.resourceType === 'script')
    const cssRequests = requests.filter(r => r.resourceType === 'stylesheet')
    const imageRequests = requests.filter(r => r.resourceType === 'image')
    
    console.log(`Total requests: ${requests.length}`)
    console.log(`JS requests: ${jsRequests.length}`)
    console.log(`CSS requests: ${cssRequests.length}`)
    console.log(`Image requests: ${imageRequests.length}`)
    
    // Should not have excessive requests
    expect(requests.length).toBeLessThan(100)
    expect(jsRequests.length).toBeLessThan(50) // Modern Next.js apps load 20-40 JS chunks
    expect(cssRequests.length).toBeLessThan(10)
  })

  test('should handle large data sets efficiently', async ({ page }) => {
    // Test with agents page (potentially large list)
    const startTime = Date.now()
    
    await page.goto('/agents')
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const loadTime = Date.now() - startTime
    console.log(`Agents page load time: ${loadTime}ms`)
    
    // Should load within reasonable time even with many agents
    expect(loadTime).toBeLessThan(5000)
    
    // Test scrolling performance
    const scrollStartTime = Date.now()
    
    // Scroll through the page
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 500)
      await page.waitForTimeout(100)
    }
    
    const scrollTime = Date.now() - scrollStartTime
    console.log(`Scroll performance: ${scrollTime}ms for 5 scrolls`)
    
    // Scrolling should be smooth (under 1s for 5 scrolls)
    expect(scrollTime).toBeLessThan(1000)
  })

  test('should optimize images properly', async ({ page }) => {
    await page.goto('/')
    
    // Get all images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i)
        
        if (await img.isVisible()) {
          // Check for proper attributes
          const src = await img.getAttribute('src')
          const alt = await img.getAttribute('alt')
          const loading = await img.getAttribute('loading')
          
          // Should have src
          expect(src).toBeTruthy()
          
          // Should have alt text (or empty alt for decorative images)
          expect(alt).not.toBeNull()
          
          // Should use lazy loading for non-critical images
          if (loading) {
            expect(['lazy', 'eager']).toContain(loading)
          }
          
          // Check image dimensions
          const dimensions = await img.evaluate(el => ({
            naturalWidth: el.naturalWidth,
            naturalHeight: el.naturalHeight,
            displayWidth: el.offsetWidth,
            displayHeight: el.offsetHeight
          }))
          
          // Images should not be significantly oversized
          if (dimensions.naturalWidth > 0 && dimensions.displayWidth > 0) {
            const widthRatio = dimensions.naturalWidth / dimensions.displayWidth
            expect(widthRatio).toBeLessThan(3) // Not more than 3x larger than display size
          }
        }
      }
    }
  })

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null
    })
    
    if (initialMemory) {
      console.log('Initial memory usage:', initialMemory)
      
      // Navigate through pages to test for memory leaks
      await page.goto('/agents')
      await page.waitForTimeout(1000)
      
      await page.goto('/sessions')
      await page.waitForTimeout(1000)
      
      await page.goto('/chat')
      await page.waitForTimeout(1000)
      
      await page.goto('/')
      await page.waitForTimeout(1000)
      
      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize
        } : null
      })
      
      if (finalMemory) {
        console.log('Final memory usage:', finalMemory)
        
        // Memory should not have grown excessively
        const memoryGrowth = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
        const growthPercentage = (memoryGrowth / initialMemory.usedJSHeapSize) * 100
        
        console.log(`Memory growth: ${memoryGrowth} bytes (${growthPercentage.toFixed(2)}%)`)
        
        // Should not grow by more than 50% during navigation
        expect(growthPercentage).toBeLessThan(50)
      }
    }
  })

  test('should handle concurrent requests efficiently', async ({ page }) => {
    // Monitor network timing
    const requestTimes: Array<{ url: string; status: number; duration: number }> = []
    
    page.on('requestfinished', async request => {
      try {
        const response = await request.response()
        if (response) {
          const timing = request.timing()
          requestTimes.push({
            url: request.url(),
            status: response.status(),
            duration: timing.responseEnd
          })
        }
      } catch (e) {
        // Ignore timing errors
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Analyze request timings
    const apiRequests = requestTimes.filter(r => 
      r.url.includes('/api/') || r.url.includes(':8080')
    )
    
    if (apiRequests.length > 0) {
      const avgResponseTime = apiRequests.reduce((sum, req) => 
        sum + req.duration, 0
      ) / apiRequests.length
      
      console.log(`Average API response time: ${avgResponseTime.toFixed(2)}ms`)
      
      // API requests should be reasonably fast
      expect(avgResponseTime).toBeLessThan(2000)
      
      // Check for failed requests
      const failedRequests = apiRequests.filter(r => r.status >= 400)
      expect(failedRequests.length).toBe(0)
    }
  })

  test('should optimize bundle size', async ({ page }) => {
    // Monitor JavaScript bundle sizes
    const scriptSizes = []
    
    page.on('response', async response => {
      if (response.request().resourceType() === 'script') {
        try {
          const buffer = await response.body()
          scriptSizes.push({
            url: response.url(),
            size: buffer.length
          })
        } catch (error) {
          // Ignore errors for external scripts
        }
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    if (scriptSizes.length > 0) {
      const totalSize = scriptSizes.reduce((sum, script) => sum + script.size, 0)
      const avgSize = totalSize / scriptSizes.length
      
      console.log(`Total JS bundle size: ${(totalSize / 1024).toFixed(2)} KB`)
      console.log(`Average script size: ${(avgSize / 1024).toFixed(2)} KB`)
      
      // Total bundle should be reasonable (adjust based on app complexity)
      // For development build with all features, allow larger size
      expect(totalSize).toBeLessThan(8 * 1024 * 1024) // 8MB for dev build
      
      // Individual scripts should not be too large
      const largeScripts = scriptSizes.filter(s => s.size > 1024 * 1024) // 1MB
      expect(largeScripts.length).toBeLessThan(5)
    }
  })

  test('should handle animations efficiently', async ({ page }) => {
    await page.goto('/')
    
    // Test animation performance
    const animationStartTime = Date.now()
    
    // Trigger some animations (hover effects, transitions)
    const animatedElements = page.locator('[data-testid="agent-card"]')
    
    if (await animatedElements.count() > 0) {
      const firstElement = animatedElements.first()
      
      // Hover to trigger animation
      await firstElement.hover()
      await page.waitForTimeout(500)
      
      // Move away to trigger exit animation
      await page.mouse.move(0, 0)
      await page.waitForTimeout(500)
    }
    
    const animationTime = Date.now() - animationStartTime
    console.log(`Animation test time: ${animationTime}ms`)
    
    // Animations should complete quickly
    expect(animationTime).toBeLessThan(2000)
    
    // Check for animation frame rate (if possible)
    const frameRate = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0
        const startTime = performance.now()
        
        function countFrame() {
          frames++
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame)
          } else {
            resolve(frames)
          }
        }
        
        requestAnimationFrame(countFrame)
      })
    })
    
    console.log(`Animation frame rate: ${frameRate} FPS`)
    
    // Should maintain reasonable frame rate
    expect(frameRate).toBeGreaterThan(30)
  })
})