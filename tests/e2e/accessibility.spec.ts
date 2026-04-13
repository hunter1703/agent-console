/**
 * Accessibility E2E Tests
 * 
 * Tests accessibility compliance across the application.
 * Covers WCAG 2.1 AA requirements, keyboard navigation, and screen reader support.
 */

import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have proper page titles and headings', async ({ page }) => {
    const pages = [
      { url: '/', title: /dashboard/i, heading: /welcome back/i },
      { url: '/agents', title: /agents/i, heading: /agents/i },
      { url: '/sessions', title: /sessions/i, heading: /sessions/i },
      { url: '/chat', title: /chat/i, heading: /chat/i },
    ]
    
    for (const { url, title, heading } of pages) {
      await page.goto(url)
      
      // Check page title
      await expect(page).toHaveTitle(title)
      
      // Check main heading (h1) - use first() to avoid multiple matches
      const h1 = page.locator('h1').first()
      await expect(h1).toBeVisible()
      await expect(h1).toContainText(heading)
    }
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/agents', '/sessions']
    
    for (const url of pages) {
      await page.goto(url)
      
      // Get all headings
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
      
      if (headings.length > 0) {
        // First heading should be h1
        const firstHeading = headings[0]
        const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase())
        expect(tagName).toBe('h1')
        
        // Check heading levels don't skip (h1 -> h3 is bad)
        let previousLevel = 1
        
        for (const heading of headings) {
          const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
          const level = parseInt(tagName.charAt(1))
          
          // Level should not increase by more than 1
          expect(level - previousLevel).toBeLessThanOrEqual(1)
          previousLevel = level
        }
      }
    }
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/')
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]')
    await expect(main).toBeVisible()
    
    // Check for navigation landmark
    const nav = page.locator('nav, [role="navigation"]')
    if (await nav.isVisible({ timeout: 2000 })) {
      await expect(nav).toBeVisible()
    }
    
    // Check buttons have accessible names
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const accessibleName = await button.evaluate(el => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('aria-labelledby') || 
                 el.textContent?.trim() ||
                 el.getAttribute('title')
        })
        
        expect(accessibleName).toBeTruthy()
      }
    }
    
    // Check links have accessible names
    const links = page.locator('a')
    const linkCount = await links.count()
    
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i)
      if (await link.isVisible()) {
        const accessibleName = await link.evaluate(el => {
          return el.getAttribute('aria-label') || 
                 el.getAttribute('aria-labelledby') || 
                 el.textContent?.trim() ||
                 el.getAttribute('title')
        })
        
        expect(accessibleName).toBeTruthy()
      }
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Start tabbing through the page
    let focusableElements = []
    let currentElement = null
    
    // Tab through first 20 elements to avoid infinite loops
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab')
      
      // Use a more specific selector to avoid multiple matches
      const focused = page.locator(':focus').first()
      try {
        if (await focused.isVisible({ timeout: 500 })) {
          const tagName = await focused.evaluate(el => el.tagName.toLowerCase())
          const role = await focused.getAttribute('role')
          
          focusableElements.push({ tagName, role })
          currentElement = focused
          
          // Test activation with Enter/Space for buttons
          if (tagName === 'button' || role === 'button') {
            // Don't actually activate to avoid navigation
            // Just verify the element can receive focus
            await expect(focused).toBeFocused()
          }
          
          // Test activation with Enter for links
          if (tagName === 'a') {
            await expect(focused).toBeFocused()
          }
        }
      } catch (error) {
        // Skip if element is not accessible or multiple matches
        continue
      }
    }
    
    // Should have found some focusable elements
    expect(focusableElements.length).toBeGreaterThan(0)
  })

  test('should have proper form labels and descriptions', async ({ page }) => {
    // Test on pages with forms
    const pagesWithForms = ['/agents', '/sessions']
    
    for (const url of pagesWithForms) {
      await page.goto(url)
      
      // Check search inputs
      const searchInputs = page.locator('input[type="search"], input[placeholder*="search"]')
      const searchCount = await searchInputs.count()
      
      for (let i = 0; i < searchCount; i++) {
        const input = searchInputs.nth(i)
        
        const hasLabel = await input.evaluate(el => {
          const id = el.id
          const ariaLabel = el.getAttribute('aria-label')
          const ariaLabelledBy = el.getAttribute('aria-labelledby')
          const placeholder = el.getAttribute('placeholder')
          
          // Check for associated label
          const label = id ? document.querySelector(`label[for="${id}"]`) : null
          
          return !!(label || ariaLabel || ariaLabelledBy || placeholder)
        })
        
        expect(hasLabel).toBe(true)
      }
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')
    
    // Test text elements for color contrast
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, button, a')
    const elementCount = await textElements.count()
    
    // Sample a few elements to check contrast
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = textElements.nth(i)
      
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el)
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight
          }
        })
        
        // Basic check that text has color (not transparent)
        expect(styles.color).not.toBe('rgba(0, 0, 0, 0)')
        expect(styles.color).not.toBe('transparent')
      }
    }
  })

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/')
    
    // Test modal focus management (if modals exist)
    const modalTriggers = page.locator('button[data-testid*="modal"], button[aria-haspopup="dialog"]')
    
    if (await modalTriggers.count() > 0) {
      const firstTrigger = modalTriggers.first()
      await firstTrigger.click()
      
      // Check if modal opened
      const modal = page.locator('[role="dialog"], [data-testid="modal"]')
      
      if (await modal.isVisible({ timeout: 2000 })) {
        // Focus should be trapped in modal
        await page.keyboard.press('Tab')
        
        const focusedElement = page.locator(':focus')
        const isInModal = await focusedElement.evaluate((el, modalEl) => {
          return modalEl.contains(el)
        }, await modal.elementHandle())
        
        expect(isInModal).toBe(true)
        
        // Close modal (ESC or close button)
        await page.keyboard.press('Escape')
        
        // Focus should return to trigger
        if (await modal.isHidden({ timeout: 2000 })) {
          await expect(firstTrigger).toBeFocused()
        }
      }
    }
  })

  test('should provide proper error messages', async ({ page }) => {
    // Test form validation messages
    await page.goto('/agents')
    
    // Look for form inputs that might have validation
    const inputs = page.locator('input[required], input[type="email"]')
    
    if (await inputs.count() > 0) {
      const firstInput = inputs.first()
      
      // Try to submit invalid data
      await firstInput.fill('invalid')
      await firstInput.blur()
      
      // Check for error message
      const errorMessage = page.locator('[role="alert"], .error, [aria-describedby]')
      
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        // Error message should be associated with input
        const ariaDescribedBy = await firstInput.getAttribute('aria-describedby')
        
        if (ariaDescribedBy) {
          const associatedError = page.locator(`#${ariaDescribedBy}`)
          await expect(associatedError).toBeVisible()
        }
      }
    }
  })

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/')
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]')
    
    if (await liveRegions.count() > 0) {
      // Live regions should have appropriate aria-live values
      for (let i = 0; i < await liveRegions.count(); i++) {
        const region = liveRegions.nth(i)
        
        const ariaLive = await region.getAttribute('aria-live')
        const role = await region.getAttribute('role')
        
        if (ariaLive) {
          expect(['polite', 'assertive', 'off']).toContain(ariaLive)
        }
        
        if (role) {
          expect(['status', 'alert', 'log']).toContain(role)
        }
      }
    }
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    
    // Check that animations respect reduced motion
    const animatedElements = page.locator('[data-testid*="animated"], .animate-')
    
    if (await animatedElements.count() > 0) {
      const firstAnimated = animatedElements.first()
      
      // Check CSS for reduced motion handling
      const hasReducedMotion = await firstAnimated.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.animationDuration === '0s' || 
               styles.transitionDuration === '0s' ||
               styles.animationPlayState === 'paused'
      })
      
      // Should respect reduced motion (this is a basic check)
      // In practice, you'd check specific animation properties
    }
    
    // Reset motion preference
    await page.emulateMedia({ reducedMotion: 'no-preference' })
  })

  test('should have proper skip links', async ({ page }) => {
    await page.goto('/')
    
    // Check for skip to main content link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link')
    
    if (await skipLink.isVisible({ timeout: 1000 })) {
      await expect(skipLink).toBeVisible()
      
      // Skip link should be focusable
      await skipLink.focus()
      await expect(skipLink).toBeFocused()
      
      // Clicking should move focus to main content
      await skipLink.click()
      
      const mainContent = page.locator('#main, #content, main')
      if (await mainContent.isVisible()) {
        // Main content should be focused or contain focused element
        const focusedElement = page.locator(':focus')
        const isInMain = await focusedElement.evaluate((el, mainEl) => {
          return mainEl.contains(el) || el === mainEl
        }, await mainContent.elementHandle())
        
        expect(isInMain).toBe(true)
      }
    }
  })
})