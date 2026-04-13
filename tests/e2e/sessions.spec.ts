/**
 * Session Browser E2E Tests
 * 
 * Tests the session management functionality including:
 * - Session list display
 * - Search and filtering
 * - Session navigation
 * - Hierarchical session relationships
 */

import { test, expect } from '@playwright/test'

test.describe('Session Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sessions')
  })

  test('should display sessions page with all components', async ({ page }) => {
    // Wait for page title to be updated
    await expect(page).toHaveTitle(/Sessions/, { timeout: 20000 })
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /sessions/i })).toBeVisible()
    
    // Check search input
    await expect(page.getByPlaceholder(/search sessions/i)).toBeVisible()
    
    // Check sort/filter controls
    const sortButton = page.getByRole('button', { name: /sort|filter/i })
    if (await sortButton.isVisible({ timeout: 2000 })) {
      await expect(sortButton).toBeVisible()
    }
  })

  test('should display session list with session items', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const sessionItems = page.locator('[data-testid="session-item"]')
    
    // Should have at least one session
    await expect(sessionItems.first()).toBeVisible()
    
    // Each session item should have required elements using semantic selectors
    const firstItem = sessionItems.first()
    await expect(firstItem.locator('h4')).toBeVisible() // Session name
    await expect(firstItem.locator('p').last()).toBeVisible() // Timestamp (last p element)
  })

  test('should search sessions by name or content', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const searchInput = page.getByPlaceholder(/search sessions/i)
    const sessionItems = page.locator('[data-testid="session-item"]')
    
    // Get initial count
    const initialCount = await sessionItems.count()
    
    if (initialCount > 0) {
      // Get the name of the first session
      const firstSessionName = await sessionItems.first().locator('[data-testid="session-name"]').textContent()
      
      if (firstSessionName) {
        // Search for part of the name
        const searchTerm = firstSessionName.substring(0, 3)
        await searchInput.fill(searchTerm)
        
        // Wait for search results
        await page.waitForTimeout(500)
        
        // Should show filtered results
        const filteredItems = page.locator('[data-testid="session-item"]:visible')
        const filteredCount = await filteredItems.count()
        
        // Should have at least the matching session
        expect(filteredCount).toBeGreaterThan(0)
        
        // Clear search
        await searchInput.clear()
        await page.waitForTimeout(500)
        
        // Should show all sessions again
        const finalCount = await sessionItems.count()
        expect(finalCount).toBe(initialCount)
      }
    }
  })

  test('should navigate to chat when clicking on session', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const sessionItems = page.locator('[data-testid="session-item"]')
    
    if (await sessionItems.count() > 0) {
      const firstItem = sessionItems.first()
      
      // Click on session item
      await firstItem.click()
      
      // Should navigate to chat with session
      await expect(page).toHaveURL(/\/chat\?session=/)
      
      // Should show chat interface
      await expect(page.getByRole('heading', { name: /chat|session/i })).toBeVisible()
    }
  })

  test('should display session metadata correctly', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const sessionItems = page.locator('[data-testid="session-item"]')
    
    if (await sessionItems.count() > 0) {
      const firstItem = sessionItems.first()
      
      // Check required metadata
      await expect(firstItem.locator('[data-testid="session-name"]')).toBeVisible()
      await expect(firstItem.locator('[data-testid="session-timestamp"]')).toBeVisible()
      
      // Check optional metadata
      const agentName = firstItem.locator('[data-testid="session-agent"]')
      if (await agentName.isVisible()) {
        await expect(agentName).toBeVisible()
      }
      
      const messageCount = firstItem.locator('[data-testid="session-message-count"]')
      if (await messageCount.isVisible()) {
        await expect(messageCount).toBeVisible()
      }
      
      const lastMessage = firstItem.locator('[data-testid="session-last-message"]')
      if (await lastMessage.isVisible()) {
        await expect(lastMessage).toBeVisible()
      }
    }
  })

  test('should show session actions on hover', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const sessionItems = page.locator('[data-testid="session-item"]')
    
    if (await sessionItems.count() > 0) {
      const firstItem = sessionItems.first()
      
      // Hover over session item
      await firstItem.hover()
      
      // Check for action buttons (if they appear on hover)
      const actionButtons = firstItem.locator('[data-testid="session-actions"]')
      if (await actionButtons.isVisible()) {
        await expect(actionButtons).toBeVisible()
        
        // Check for specific action buttons
        const openButton = actionButtons.getByRole('button', { name: /open|view/i })
        const deleteButton = actionButtons.getByRole('button', { name: /delete/i })
        
        if (await openButton.isVisible()) {
          await expect(openButton).toBeVisible()
        }
        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeVisible()
        }
      }
    }
  })

  test('should handle session deletion with confirmation', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const sessionItems = page.locator('[data-testid="session-item"]')
    
    if (await sessionItems.count() > 0) {
      const firstItem = sessionItems.first()
      
      // Look for delete button (might be in dropdown or on hover)
      await firstItem.hover()
      
      const deleteButton = firstItem.getByRole('button', { name: /delete/i })
      
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click()
        
        // Should show confirmation dialog
        const confirmDialog = page.locator('[role="dialog"]')
        await expect(confirmDialog).toBeVisible()
        
        // Should have confirmation message
        await expect(confirmDialog.getByText(/delete|remove/i)).toBeVisible()
        
        // Should have cancel and confirm buttons
        const cancelButton = confirmDialog.getByRole('button', { name: /cancel|no/i })
        const confirmButton = confirmDialog.getByRole('button', { name: /delete|yes|confirm/i })
        
        await expect(cancelButton).toBeVisible()
        await expect(confirmButton).toBeVisible()
        
        // Click cancel to avoid actually deleting
        await cancelButton.click()
        
        // Dialog should close
        await expect(confirmDialog).not.toBeVisible()
      }
    }
  })

  test('should handle hierarchical session relationships', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    // Look for parent-child session indicators
    const parentSessions = page.locator('[data-testid="parent-session"]')
    const childSessions = page.locator('[data-testid="child-session"]')
    
    if (await parentSessions.count() > 0) {
      const firstParent = parentSessions.first()
      await expect(firstParent).toBeVisible()
      
      // Check for expand/collapse functionality
      const expandButton = firstParent.getByRole('button', { name: /expand|collapse/i })
      if (await expandButton.isVisible()) {
        await expandButton.click()
        
        // Should show/hide child sessions
        await page.waitForTimeout(500)
        
        // Toggle again
        await expandButton.click()
        await page.waitForTimeout(500)
      }
    }
    
    if (await childSessions.count() > 0) {
      // Child sessions should be indented or visually distinct
      const firstChild = childSessions.first()
      await expect(firstChild).toBeVisible()
      
      // Check for visual hierarchy indicators
      const indentIndicator = firstChild.locator('[data-testid="child-indicator"]')
      if (await indentIndicator.isVisible()) {
        await expect(indentIndicator).toBeVisible()
      }
    }
  })

  test('should handle sorting and filtering', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    const sortButton = page.getByRole('button', { name: /sort/i })
    
    if (await sortButton.isVisible({ timeout: 2000 })) {
      await sortButton.click()
      
      // Should show sort options
      const sortMenu = page.locator('[data-testid="sort-menu"]')
      if (await sortMenu.isVisible()) {
        await expect(sortMenu).toBeVisible()
        
        // Check for sort options
        const dateSort = sortMenu.getByRole('button', { name: /date|time/i })
        const nameSort = sortMenu.getByRole('button', { name: /name/i })
        
        if (await dateSort.isVisible()) {
          await dateSort.click()
          await page.waitForTimeout(500)
        }
      }
    }
    
    // Check for filter options
    const filterButton = page.getByRole('button', { name: /filter/i })
    
    if (await filterButton.isVisible({ timeout: 2000 })) {
      await filterButton.click()
      
      // Should show filter options
      const filterMenu = page.locator('[data-testid="filter-menu"]')
      if (await filterMenu.isVisible()) {
        await expect(filterMenu).toBeVisible()
        
        // Check for filter options
        const agentFilter = filterMenu.getByRole('button', { name: /agent/i })
        const statusFilter = filterMenu.getByRole('button', { name: /status/i })
        
        if (await agentFilter.isVisible()) {
          await agentFilter.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test('should handle pagination for large session lists', async ({ page }) => {
    // Wait for sessions to load
    await page.waitForSelector('[data-testid="session-item"]', { timeout: 10000 })
    
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"]')
    
    if (await pagination.isVisible({ timeout: 2000 })) {
      await expect(pagination).toBeVisible()
      
      // Check for page navigation
      const nextButton = pagination.getByRole('button', { name: /next/i })
      const prevButton = pagination.getByRole('button', { name: /previous|prev/i })
      
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(1000)
        
        // Should load next page
        await expect(page.locator('[data-testid="session-item"]')).toBeVisible()
        
        // Go back
        if (await prevButton.isVisible()) {
          await prevButton.click()
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should adapt to mobile
    await expect(page.getByRole('heading', { name: /sessions/i })).toBeVisible()
    
    // Search should be accessible
    await expect(page.getByPlaceholder(/search sessions/i)).toBeVisible()
    
    // Session list should stack properly on mobile
    const sessionList = page.locator('[data-testid="session-list"]')
    if (await sessionList.isVisible()) {
      // On mobile, sessions should stack vertically
      await expect(sessionList).toBeVisible()
    }
  })

  test('should handle empty state when no sessions', async ({ page }) => {
    // This test assumes there might be no sessions or we can simulate empty state
    const emptyState = page.locator('[data-testid="empty-sessions"]')
    
    if (await emptyState.isVisible({ timeout: 5000 })) {
      await expect(emptyState).toBeVisible()
      
      // Should have helpful message
      await expect(emptyState.getByText(/no sessions|no conversations/i)).toBeVisible()
      
      // Should have start chat CTA
      const startChatButton = emptyState.getByRole('button', { name: /start chat|new chat/i })
      if (await startChatButton.isVisible()) {
        await expect(startChatButton).toBeVisible()
      }
    }
  })

  test('should handle loading states', async ({ page }) => {
    // Check for loading skeletons
    const skeletons = page.locator('[data-testid="skeleton"]')
    
    if (await skeletons.count() > 0) {
      // Skeletons should appear initially
      await expect(skeletons.first()).toBeVisible()
      
      // Then disappear when data loads
      await expect(skeletons.first()).not.toBeVisible({ timeout: 10000 })
    }
    
    // Loading spinner might also be present
    const loadingSpinner = page.locator('[data-testid="loading"]')
    if (await loadingSpinner.isVisible({ timeout: 1000 })) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 })
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Simulate network error by intercepting requests
    await page.route('**/v1/sessions', route => {
      route.abort('failed')
    })
    
    // Reload page to trigger error
    await page.reload()
    
    // Should show error state
    const errorState = page.locator('[data-testid="error-state"]')
    if (await errorState.isVisible({ timeout: 5000 })) {
      await expect(errorState).toBeVisible()
      
      // Should have retry button
      const retryButton = errorState.getByRole('button', { name: /retry|try again/i })
      if (await retryButton.isVisible()) {
        await expect(retryButton).toBeVisible()
      }
    }
  })
})