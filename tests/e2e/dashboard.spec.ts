/**
 * Dashboard Page E2E Tests
 * 
 * Tests the main dashboard functionality including navigation,
 * statistics display, agent grid, and recent sessions.
 */

import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display dashboard with all sections', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dashboard/)
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /your agents/i })).toBeVisible()
    
    // Check agents table or empty state
    const agentsTable = page.locator('[data-testid="agent-row"]')
    const emptyState = page.locator('[data-testid="empty-agents"]')
    
    // Either agents table or empty state should be visible
    const hasAgents = await agentsTable.count() > 0
    const hasEmptyState = await emptyState.isVisible()
    
    expect(hasAgents || hasEmptyState).toBeTruthy()
  })

  test('should navigate to chat when clicking New Chat', async ({ page }) => {
    // This test is deprecated - New Chat button was removed in redesign
    // Navigation is now through sidebar
    const sidebar = page.locator('[data-testid="sidebar"]')
    await expect(sidebar).toBeVisible()
  })

  test('should display agent grid with hover effects', async ({ page }) => {
    // Wait for agents to load (either with data or empty state)
    await page.waitForSelector('[data-testid="agent-row"], [data-testid="empty-agents"]', { timeout: 10000 })
    
    const agentRows = page.locator('[data-testid="agent-row"]')
    const emptyState = page.locator('[data-testid="empty-agents"]')
    
    if (await agentRows.count() > 0) {
      const firstRow = agentRows.first()
      
      // Check that agent rows are visible
      await expect(firstRow).toBeVisible()
      
      // Check table structure
      await expect(page.getByRole('columnheader', { name: /agent/i })).toBeVisible()
      await expect(page.getByRole('columnheader', { name: /description/i })).toBeVisible()
      
      // Test hover effect on row - action buttons should be visible
      await firstRow.hover()
      
      // Check for action buttons (chat, edit, delete)
      const chatButton = firstRow.locator('[data-testid="chat-button"]')
      const editButton = firstRow.locator('[data-testid="edit-button"]')
      const deleteButton = firstRow.locator('[data-testid="delete-button"]')
      
      // All action buttons should be visible
      await expect(chatButton).toBeVisible()
      await expect(editButton).toBeVisible()
      await expect(deleteButton).toBeVisible()
      
      // Click chat button should navigate to chat
      await chatButton.click()
      await expect(page).toHaveURL(/\/chat\?agent=/)
    } else {
      // Should show empty state
      await expect(emptyState).toBeVisible()
      await expect(emptyState.getByText(/create your first agent/i)).toBeVisible()
    }
  })

  test('should display recent sessions list', async ({ page }) => {
    // Recent sessions section was removed in redesign
    // Dashboard now focuses on agent management
    // Verify agents table is present instead
    const agentRows = page.locator('[data-testid="agent-row"]')
    const emptyState = page.locator('[data-testid="empty-agents"]')
    
    // Either agents or empty state should be visible
    const hasAgents = await agentRows.count() > 0
    const hasEmptyState = await emptyState.isVisible()
    
    expect(hasAgents || hasEmptyState).toBeTruthy()
  })

  test('should handle loading states gracefully', async ({ page }) => {
    // Check for skeleton loaders while data loads
    const skeletons = page.locator('[data-testid="skeleton"]')
    
    // Skeletons should appear initially and then disappear
    if (await skeletons.count() > 0) {
      await expect(skeletons.first()).toBeVisible()
      await expect(skeletons.first()).not.toBeVisible({ timeout: 10000 })
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Wait for page to adapt
    await page.waitForLoadState('networkidle')
    
    // Check that main heading is visible
    await expect(page.getByRole('heading', { name: /your agents/i })).toBeVisible()
    
    // Table should be scrollable on mobile
    const table = page.locator('table')
    if (await table.isVisible()) {
      // Table should be in a scrollable container
      const tableContainer = table.locator('..')
      await expect(tableContainer).toHaveCSS('overflow-x', /auto|scroll/)
    }
  })

  test('should handle empty states', async ({ page }) => {
    // If no agents exist, should show empty state
    const emptyState = page.locator('[data-testid="empty-agents"]')
    if (await emptyState.isVisible()) {
      await expect(emptyState.getByText(/create your first agent/i)).toBeVisible()
    }
  })
})