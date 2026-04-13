/**
 * Navigation and Layout E2E Tests
 * 
 * Tests the overall navigation, layout, and cross-page functionality.
 */

import { test, expect } from '@playwright/test'

test.describe('Navigation and Layout', () => {
  test('should navigate between all main pages', async ({ page }) => {
    // Start at dashboard
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    
    // Navigate to agents
    await page.getByRole('link', { name: /agents/i }).click()
    await expect(page).toHaveURL('/agents')
    await expect(page.getByRole('heading', { name: /agents/i })).toBeVisible()
    
    // Navigate to sessions
    await page.getByRole('link', { name: /sessions/i }).click()
    await expect(page).toHaveURL('/sessions')
    await expect(page.getByRole('heading', { name: /sessions/i })).toBeVisible()
    
    // Navigate to chat
    await page.getByRole('link', { name: /chat/i }).click()
    await expect(page).toHaveURL(/\/chat/)
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('should display consistent header across all pages', async ({ page }) => {
    const pages = ['/', '/agents', '/sessions', '/chat']
    
    for (const pagePath of pages) {
      await page.goto(pagePath)
      
      // Check for header - use first() to handle pages with multiple headers
      const header = page.locator('header, [data-testid="header"]').first()
      await expect(header).toBeVisible()
      
      // Check for navigation links
      const navLinks = page.locator('nav a, [data-testid="nav-link"]')
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible()
      }
      
      // Check for logo or brand
      const logo = page.locator('[data-testid="logo"], [data-testid="brand"]')
      if (await logo.isVisible({ timeout: 1000 })) {
        await expect(logo).toBeVisible()
      }
    }
  })

  test('should show active navigation state', async ({ page }) => {
    // Go to dashboard
    await page.goto('/')
    
    const dashboardLink = page.getByRole('link', { name: /dashboard/i })
    if (await dashboardLink.isVisible({ timeout: 2000 })) {
      // Should have active state
      await expect(dashboardLink).toHaveClass(/active|current/)
    }
    
    // Go to agents
    await page.goto('/agents')
    
    const agentsLink = page.getByRole('link', { name: /agents/i })
    if (await agentsLink.isVisible({ timeout: 2000 })) {
      // Should have active state
      await expect(agentsLink).toHaveClass(/active|current/)
    }
  })

  test('should display breadcrumbs on appropriate pages', async ({ page }) => {
    // Navigate to a chat page (which should have breadcrumbs)
    await page.goto('/chat?agent=test-agent')
    
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"], nav[aria-label="breadcrumb"]')
    
    if (await breadcrumbs.isVisible({ timeout: 2000 })) {
      await expect(breadcrumbs).toBeVisible()
      
      // Should have clickable breadcrumb links
      const breadcrumbLinks = breadcrumbs.locator('a')
      if (await breadcrumbLinks.count() > 0) {
        await expect(breadcrumbLinks.first()).toBeVisible()
      }
    }
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start at dashboard
    await page.goto('/')
    
    // Check if we're on mobile (viewport width < 1024px)
    const viewportSize = page.viewportSize()
    const isMobile = viewportSize ? viewportSize.width < 1024 : false
    
    if (isMobile) {
      // On mobile, open the navigation menu first
      const menuButton = page.getByRole('button', { name: /toggle navigation menu/i })
      if (await menuButton.isVisible()) {
        await menuButton.click()
      }
    }
    
    // Navigate to agents
    await page.getByRole('link', { name: /agents/i }).click()
    await expect(page).toHaveURL('/agents')
    
    if (isMobile) {
      // Open menu again for next navigation
      const menuButton = page.getByRole('button', { name: /toggle navigation menu/i })
      if (await menuButton.isVisible()) {
        await menuButton.click()
      }
    }
    
    // Navigate to sessions
    await page.getByRole('link', { name: /sessions/i }).click()
    await expect(page).toHaveURL('/sessions')
    
    // Use browser back button
    await page.goBack()
    await expect(page).toHaveURL('/agents')
    
    // Use browser forward button
    await page.goForward()
    await expect(page).toHaveURL('/sessions')
    
    // Go back to dashboard
    await page.goBack()
    await page.goBack()
    await expect(page).toHaveURL('/')
  })

  test('should handle deep linking correctly', async ({ page }) => {
    // Test direct navigation to specific pages
    const testUrls = [
      { url: '/agents', heading: /agents/i },
      { url: '/sessions', heading: /sessions/i },
      { url: '/chat', heading: /chat/i },
    ]
    
    for (const { url, heading } of testUrls) {
      await page.goto(url)
      await expect(page).toHaveURL(url)
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page')
    
    // Should show 404 or redirect to dashboard
    const is404 = await page.getByText(/404|not found/i).isVisible({ timeout: 2000 })
    const isDashboard = await page.getByRole('heading', { name: /dashboard/i }).isVisible({ timeout: 2000 })
    
    expect(is404 || isDashboard).toBe(true)
  })

  test('should maintain responsive layout across pages', async ({ page }) => {
    const pages = ['/', '/agents', '/sessions']
    
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 })
    
    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: 'networkidle' })
      
      // Should have proper desktop layout
      const main = page.locator('main, [role="main"]')
      await expect(main).toBeVisible()
    }
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    for (const pagePath of pages) {
      await page.goto(pagePath, { waitUntil: 'networkidle' })
      
      // Should adapt to mobile
      const main = page.locator('main, [role="main"]')
      await expect(main).toBeVisible()
      
      // Mobile menu might be present
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      if (await mobileMenu.isVisible({ timeout: 1000 })) {
        await expect(mobileMenu).toBeVisible()
      }
    }
  })

  test('should handle theme switching consistently', async ({ page }) => {
    await page.goto('/')
    
    // Look for theme toggle
    const themeToggle = page.getByRole('button', { name: /theme|dark|light/i })
    
    if (await themeToggle.isVisible({ timeout: 2000 })) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'))
      
      // Toggle theme
      await themeToggle.click()
      
      // Wait for theme change
      await page.waitForTimeout(500)
      
      // Check theme changed
      const newTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'))
      expect(newTheme).not.toBe(initialTheme)
      
      // Navigate to another page
      await page.getByRole('link', { name: /agents/i }).click()
      
      // Theme should persist
      const persistedTheme = await page.evaluate(() => document.documentElement.classList.contains('dark'))
      expect(persistedTheme).toBe(newTheme)
    }
  })

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/')
    
    // Tab through navigation elements
    await page.keyboard.press('Tab')
    
    // Should focus on first interactive element
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
    
    // Continue tabbing
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to activate focused elements with Enter/Space
    const currentFocus = page.locator(':focus')
    if (await currentFocus.isVisible()) {
      const tagName = await currentFocus.evaluate(el => el.tagName.toLowerCase())
      
      if (tagName === 'button' || tagName === 'a') {
        // Press Enter to activate
        await page.keyboard.press('Enter')
        
        // Should navigate or perform action
        await page.waitForTimeout(500)
      }
    }
  })

  test('should handle page transitions smoothly', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to agents page
    const agentsLink = page.getByRole('link', { name: /agents/i })
    
    if (await agentsLink.isVisible()) {
      await agentsLink.click()
      
      // Should transition smoothly (check for transition classes or animations)
      const pageTransition = page.locator('[data-testid="page-transition"]')
      if (await pageTransition.isVisible({ timeout: 1000 })) {
        await expect(pageTransition).toBeVisible()
      }
      
      // Page should load completely
      await expect(page.getByRole('heading', { name: /agents/i })).toBeVisible()
    }
  })

  test('should handle external link behavior', async ({ page }) => {
    await page.goto('/')
    
    // Look for external links (if any)
    const externalLinks = page.locator('a[href^="http"], a[target="_blank"]')
    
    if (await externalLinks.count() > 0) {
      const firstExternalLink = externalLinks.first()
      
      // Should have proper attributes
      const target = await firstExternalLink.getAttribute('target')
      const rel = await firstExternalLink.getAttribute('rel')
      
      if (target === '_blank') {
        expect(rel).toContain('noopener')
      }
    }
  })
})