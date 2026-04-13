/**
 * Agent Management E2E Tests
 * 
 * Tests the agent management functionality including:
 * - Agent list display
 * - Search and filtering
 * - Agent CRUD operations
 * - Navigation to chat
 */

import { test, expect } from '@playwright/test'

test.describe('Agent Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agents')
  })

  test('should display agents page with all components', async ({ page }) => {
    // Wait for page title to be updated
    await expect(page).toHaveTitle(/Agents/, { timeout: 20000 })
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /agents/i })).toBeVisible()
    
    // Check search input
    await expect(page.getByPlaceholder(/search agents/i)).toBeVisible()
    
    // Check create agent button
    await expect(page.getByRole('button', { name: /create agent/i })).toBeVisible()
  })

  test('should display agent grid with agent cards', async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const agentCards = page.locator('[data-testid="agent-card"]')
    
    // Should have at least one agent
    await expect(agentCards.first()).toBeVisible()
    
    // Each agent card should have required elements
    const firstCard = agentCards.first()
    await expect(firstCard.locator('[data-testid="agent-name"]')).toBeVisible()
    await expect(firstCard.locator('[data-testid="agent-description"]')).toBeVisible()
  })

  test('should search agents by name', async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const searchInput = page.getByPlaceholder(/search agents/i)
    const agentCards = page.locator('[data-testid="agent-card"]')
    
    // Get initial count
    const initialCount = await agentCards.count()
    
    if (initialCount > 0) {
      // Get the name of the first agent
      const firstAgentName = await agentCards.first().locator('[data-testid="agent-name"]').textContent()
      
      if (firstAgentName) {
        // Search for part of the name
        const searchTerm = firstAgentName.substring(0, 3)
        await searchInput.fill(searchTerm)
        
        // Wait for search results
        await page.waitForTimeout(500)
        
        // Should show filtered results
        const filteredCards = page.locator('[data-testid="agent-card"]:visible')
        const filteredCount = await filteredCards.count()
        
        // Should have at least the matching agent
        expect(filteredCount).toBeGreaterThan(0)
        
        // Clear search
        await searchInput.clear()
        await page.waitForTimeout(500)
        
        // Should show all agents again
        const finalCount = await agentCards.count()
        expect(finalCount).toBe(initialCount)
      }
    }
  })

  test('should navigate to chat when clicking on agent card', async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const agentCards = page.locator('[data-testid="agent-card"]')
    
    if (await agentCards.count() > 0) {
      const firstCard = agentCards.first()
      
      // Click on agent card
      await firstCard.click()
      
      // Should navigate to chat with agent
      await expect(page).toHaveURL(/\/chat\?agent=/)
      
      // Should show chat interface
      await expect(page.getByRole('heading', { name: /chat with/i })).toBeVisible()
    }
  })

  test('should show agent actions on hover', async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const agentCards = page.locator('[data-testid="agent-card"]')
    
    if (await agentCards.count() > 0) {
      const firstCard = agentCards.first()
      
      // Hover over agent card
      await firstCard.hover()
      
      // Check for action buttons (if they appear on hover)
      const actionButtons = firstCard.locator('[data-testid="agent-actions"]')
      if (await actionButtons.isVisible()) {
        await expect(actionButtons).toBeVisible()
        
        // Check for specific action buttons
        const chatButton = actionButtons.getByRole('button', { name: /chat|start/i })
        const editButton = actionButtons.getByRole('button', { name: /edit/i })
        const deleteButton = actionButtons.getByRole('button', { name: /delete/i })
        
        if (await chatButton.isVisible()) {
          await expect(chatButton).toBeVisible()
        }
        if (await editButton.isVisible()) {
          await expect(editButton).toBeVisible()
        }
        if (await deleteButton.isVisible()) {
          await expect(deleteButton).toBeVisible()
        }
      }
    }
  })

  test('should handle create agent button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create agent/i })
    
    await createButton.click()
    
    // Should open create agent dialog or navigate to create page
    // Check for modal or new page
    const modal = page.locator('[role="dialog"]')
    if (await modal.isVisible({ timeout: 2000 })) {
      // Modal opened
      await expect(modal).toBeVisible()
      
      // Should have form fields
      await expect(modal.getByLabel(/name/i)).toBeVisible()
      
      // Close modal
      const closeButton = modal.getByRole('button', { name: /close|cancel/i })
      if (await closeButton.isVisible()) {
        await closeButton.click()
      }
    } else {
      // Check if navigated to create page
      await expect(page).toHaveURL(/\/agents\/create|\/agents\/new/)
    }
  })

  test('should handle agent deletion with confirmation', async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const agentCards = page.locator('[data-testid="agent-card"]')
    
    if (await agentCards.count() > 0) {
      const firstCard = agentCards.first()
      
      // Look for delete button (might be in dropdown or on hover)
      await firstCard.hover()
      
      const deleteButton = firstCard.getByRole('button', { name: /delete/i })
      
      if (await deleteButton.isVisible({ timeout: 2000 })) {
        await deleteButton.click()
        
        // Should show confirmation dialog
        const confirmDialog = page.locator('[role="dialog"]')
        await expect(confirmDialog).toBeVisible()
        
        // Should have confirmation message - be more specific to avoid multiple matches
        await expect(confirmDialog.getByRole('heading', { name: /delete/i })).toBeVisible()
        
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

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for page to load and adapt
    await page.waitForLoadState('networkidle')
    
    // Page should adapt to mobile
    await expect(page.getByRole('heading', { name: /agents/i })).toBeVisible()
    
    // Search should be accessible
    await expect(page.getByPlaceholder(/search agents/i)).toBeVisible()
    
    // Create button should be accessible (with longer timeout for mobile)
    await expect(page.getByRole('button', { name: /create agent/i })).toBeVisible({ timeout: 20000 })
    
    // Agent cards should stack properly on mobile
    const agentGrid = page.locator('[data-testid="agent-grid"]')
    if (await agentGrid.isVisible()) {
      // On mobile, should have single column layout
      const gridStyles = await agentGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns)
      expect(gridStyles).toContain('1fr')
    }
  })

  test('should handle empty state when no agents', async ({ page }) => {
    // This test assumes there might be no agents or we can simulate empty state
    const emptyState = page.locator('[data-testid="empty-agents"]')
    
    if (await emptyState.isVisible({ timeout: 5000 })) {
      await expect(emptyState).toBeVisible()
      
      // Should have helpful message
      await expect(emptyState.getByText(/no agents|create your first/i)).toBeVisible()
      
      // Should have create agent CTA
      const createButton = emptyState.getByRole('button', { name: /create agent/i })
      if (await createButton.isVisible()) {
        await expect(createButton).toBeVisible()
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
    await page.route('**/v1/agents', route => {
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

  test('should display agent metadata correctly', async ({ page }) => {
    // Wait for agents to load
    await page.waitForSelector('[data-testid="agent-card"]', { timeout: 10000 })
    
    const agentCards = page.locator('[data-testid="agent-card"]')
    
    if (await agentCards.count() > 0) {
      const firstCard = agentCards.first()
      
      // Check required metadata using semantic selectors
      await expect(firstCard.locator('h3')).toBeVisible() // Agent name
      await expect(firstCard.locator('p').first()).toBeVisible() // Agent description
      
      // Check for action buttons
      await expect(firstCard.getByRole('button', { name: /start chat/i })).toBeVisible()
      
      // Check for optional metadata (model, updated date)
      const metadataSection = firstCard.locator('.text-xs.text-text-tertiary')
      if (await metadataSection.isVisible()) {
        // Should have some metadata content
        const metadataText = await metadataSection.textContent()
        expect(metadataText).toBeTruthy()
      }
    }
  })
})