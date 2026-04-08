import { test, expect } from '@playwright/test'

test.describe('Demo Page Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should load the demo page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Agent Console V2')
  })

  test('should display all button variants', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Primary Button' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Secondary Button' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ghost Button' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Danger Button' })).toBeVisible()
  })

  test('should display toggle switches', async ({ page }) => {
    const toggles = page.locator('[role="switch"]')
    await expect(toggles).toHaveCount(4) // sm, md, lg, disabled
  })

  test('should display checkboxes', async ({ page }) => {
    const checkboxes = page.locator('[role="checkbox"]')
    await expect(checkboxes.first()).toBeVisible()
  })

  test('should display radio buttons', async ({ page }) => {
    const radios = page.locator('[role="radio"]')
    await expect(radios.first()).toBeVisible()
  })

  test('should display skeleton loading states', async ({ page }) => {
    // Click the Show Loading button
    await page.getByRole('button', { name: /Show Loading/i }).click()
    
    // Wait a bit for skeletons to appear
    await page.waitForTimeout(100)
    
    // Check if skeleton elements are visible
    const skeletons = page.locator('.animate-pulse')
    await expect(skeletons.first()).toBeVisible()
  })

  test('should display stagger list animations', async ({ page }) => {
    // Scroll to stagger section
    await page.locator('text=Stagger Animations').scrollIntoViewIfNeeded()
    
    // Check if list items are visible
    const listItems = page.locator('text=First Item')
    await expect(listItems).toBeVisible()
  })

  test('should switch between page transition views', async ({ page }) => {
    // Find the View 1 and View 2 buttons
    await page.locator('text=Page Transitions').scrollIntoViewIfNeeded()
    
    const view1Button = page.getByRole('button', { name: 'View 1' })
    const view2Button = page.getByRole('button', { name: 'View 2' })
    
    // Click View 2
    await view2Button.click()
    await expect(page.locator('text=This is the second view')).toBeVisible()
    
    // Click View 1
    await view1Button.click()
    await expect(page.locator('text=This is the first view')).toBeVisible()
  })

  test('should open and close modal', async ({ page }) => {
    // Click Open Modal button
    await page.getByRole('button', { name: 'Open Modal' }).click()
    
    // Check if modal is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator('text=Example Modal')).toBeVisible()
    
    // Close modal by clicking Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Check if modal is closed
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should show toast notifications', async ({ page }) => {
    // Click Success Toast button
    await page.getByRole('button', { name: 'Success Toast' }).click()
    
    // Check if toast appears
    await expect(page.locator('text=Success! Operation completed.')).toBeVisible()
    
    // Wait for toast to disappear (auto-dismiss after 3s)
    await page.waitForTimeout(3500)
    await expect(page.locator('text=Success! Operation completed.')).not.toBeVisible()
  })

  test('should display animated text with character reveal', async ({ page }) => {
    // Check if animated text section exists
    await expect(page.locator('text=Animated Text')).toBeVisible()
    
    // Check if the demo text is visible
    await expect(page.locator('text=The quick brown fox')).toBeVisible()
  })

  test('should display scroll reveal animations', async ({ page }) => {
    // Scroll to bottom to trigger scroll reveals
    await page.locator('text=Scroll-Triggered Animations').scrollIntoViewIfNeeded()
    
    // Wait for animations to complete
    await page.waitForTimeout(500)
    
    // Check if revealed content is visible
    await expect(page.locator('text=Reveal from Bottom')).toBeVisible()
  })

  test('should display shimmer effects', async ({ page }) => {
    await page.locator('text=Shimmer Effects').scrollIntoViewIfNeeded()
    
    // Check if shimmer card is visible
    await expect(page.locator('text=Loading Card')).toBeVisible()
  })

  test('should display avatars', async ({ page }) => {
    await page.locator('text=Avatars').scrollIntoViewIfNeeded()
    
    // Check if avatars are rendered
    const avatars = page.locator('.rounded-full').filter({ hasText: /^[A-Z]{1,2}$/ })
    await expect(avatars.first()).toBeVisible()
  })

  test('should display icons with animations', async ({ page }) => {
    await page.locator('text=Icons').scrollIntoViewIfNeeded()
    
    // Check if icons section is visible
    await expect(page.locator('text=Default')).toBeVisible()
    await expect(page.locator('text=Spin')).toBeVisible()
    await expect(page.locator('text=Pulse')).toBeVisible()
  })

  test('should display cards with different variants', async ({ page }) => {
    await page.locator('text=Cards').scrollIntoViewIfNeeded()
    
    // Check if different card variants are visible
    await expect(page.locator('text=Default Card')).toBeVisible()
    await expect(page.locator('text=Elevated Card')).toBeVisible()
    await expect(page.locator('text=Outlined Card')).toBeVisible()
    await expect(page.locator('text=Glass Card')).toBeVisible()
  })

  test('should display inputs with validation', async ({ page }) => {
    await page.locator('text=Inputs').scrollIntoViewIfNeeded()
    
    // Find the email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    
    // Click submit without filling email
    await page.getByRole('button', { name: 'Submit' }).click()
    
    // Check if error message appears
    await expect(page.locator('text=Email is required')).toBeVisible()
  })
})
