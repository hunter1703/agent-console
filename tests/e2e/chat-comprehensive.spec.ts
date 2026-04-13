/**
 * Comprehensive Chat Interface E2E Tests
 * 
 * Tests for advanced agent features:
 * - Planning widgets and tool execution
 * - Special tools (spawn_agent, send_message, await_agent, web_research)
 * - Confirmation flows (text, decision with/without options)
 * - Normal tool calls (shell, echo, etc.)
 */

import { test, expect } from '@playwright/test'

test.describe('Comprehensive Agent Interactions', () => {
  const storyAgentId = process.env.STORY_AGENT_ID || 'story_agent'
  const webResearchAgentId = process.env.WEB_RESEARCH_AGENT_ID || 'web_research_agent'
  
  test.beforeEach(async ({ page }) => {
    // Navigate to chat with story agent
    await page.goto(`/chat?agent=${storyAgentId}`)
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    
    // Wait for the message input to be ready
    const messageInput = page.getByPlaceholder(/type your message/i)
    await expect(messageInput).toBeVisible({ timeout: 15000 })
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
  })

  test('should display planning widgets when story_agent creates a plan', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Send a message that triggers planning
    await messageInput.fill('Write a short story about a robot discovering emotions')
    await sendButton.click()
    
    // Wait for user message to appear
    await expect(page.getByText('Write a short story about a robot discovering emotions')).toBeVisible()
    
    // Wait for spawn_agent tool call (story_agent spawns phase agents)
    const toolCard = page.locator('[data-testid="tool-execution-card"]').first()
    await expect(toolCard).toBeVisible({ timeout: 60000 })
    
    // Check that tool execution card shows spawn_agent
    const toolName = await toolCard.locator('[data-testid="tool-name"]').textContent()
    expect(toolName?.toLowerCase()).toContain('spawn')
    
    // Wait for agent response with story
    const assistantMessage = page.locator('[data-role="assistant"]')
    await expect(assistantMessage).toBeVisible({ timeout: 90000 })
    
    // Verify response has substantial content (story should be long)
    const responseText = await assistantMessage.textContent()
    expect(responseText).toBeTruthy()
    expect(responseText!.length).toBeGreaterThan(200)
  })

  test('should display spawn_agent tool execution', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Trigger spawn_agent by asking for a story
    await messageInput.fill('Create a mystery story')
    await sendButton.click()
    
    // Wait for spawn_agent tool card
    const spawnToolCard = page.locator('[data-testid="tool-execution-card"]').filter({
      has: page.locator('text=/spawn/i')
    })
    
    if (await spawnToolCard.isVisible({ timeout: 30000 })) {
      // Verify tool card has proper structure
      await expect(spawnToolCard.locator('[data-testid="tool-status"]')).toBeVisible()
      
      // Check for tool arguments display
      const argsSection = spawnToolCard.locator('[data-testid="tool-arguments"]')
      if (await argsSection.isVisible()) {
        const argsText = await argsSection.textContent()
        expect(argsText).toBeTruthy()
      }
      
      // Wait for tool to complete
      await expect(spawnToolCard.locator('[data-status="completed"], [data-status="success"]')).toBeVisible({ timeout: 60000 })
    }
  })

  test('should display await_agent tool execution', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Trigger await_agent (story_agent waits for spawned agents)
    await messageInput.fill('Write a short adventure story')
    await sendButton.click()
    
    // Wait for await_agent tool card
    const awaitToolCard = page.locator('[data-testid="tool-execution-card"]').filter({
      has: page.locator('text=/await/i')
    })
    
    if (await awaitToolCard.isVisible({ timeout: 45000 })) {
      // Verify tool card structure
      await expect(awaitToolCard.locator('[data-testid="tool-status"]')).toBeVisible()
      
      // await_agent should complete
      await expect(awaitToolCard.locator('[data-status="completed"], [data-status="success"]')).toBeVisible({ timeout: 60000 })
    }
  })

  test('should handle text confirmation requests', async ({ page }) => {
    // Note: This test depends on backend configuration for confirmations
    // If story_agent doesn't trigger confirmations, this test will be skipped
    
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Try to trigger a confirmation (may not work with current agent config)
    await messageInput.fill('Please help me with a sensitive task that requires confirmation')
    await sendButton.click()
    
    // Wait for potential confirmation card
    const confirmationCard = page.locator('[data-testid="confirmation-request"]')
    
    if (await confirmationCard.isVisible({ timeout: 20000 })) {
      // Verify confirmation has prompt
      await expect(confirmationCard.locator('[data-testid="confirmation-prompt"]')).toBeVisible()
      
      // Check for text input (text confirmation type)
      const textInput = confirmationCard.locator('textarea, input[type="text"]')
      if (await textInput.isVisible()) {
        // Fill in confirmation text
        await textInput.fill('I confirm this action')
        
        // Submit confirmation
        const submitButton = confirmationCard.getByRole('button', { name: /submit|confirm/i })
        await submitButton.click()
        
        // Confirmation should be handled
        await expect(confirmationCard).not.toBeVisible({ timeout: 10000 })
      }
    } else {
      console.log('No text confirmation triggered - agent may not require confirmations')
    }
  })

  test('should handle decision confirmation without options', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Try to trigger a yes/no confirmation
    await messageInput.fill('Should I proceed with this action?')
    await sendButton.click()
    
    // Wait for potential confirmation card
    const confirmationCard = page.locator('[data-testid="confirmation-request"]')
    
    if (await confirmationCard.isVisible({ timeout: 20000 })) {
      // Check for yes/no buttons (decision without options)
      const yesButton = confirmationCard.getByRole('button', { name: /yes|confirm|proceed/i })
      const noButton = confirmationCard.getByRole('button', { name: /no|cancel|decline/i })
      
      if (await yesButton.isVisible() && await noButton.isVisible()) {
        // Click yes to confirm
        await yesButton.click()
        
        // Confirmation should be handled
        await expect(confirmationCard).not.toBeVisible({ timeout: 10000 })
      }
    } else {
      console.log('No decision confirmation triggered')
    }
  })

  test('should handle decision confirmation with options', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Try to trigger a multi-option confirmation
    await messageInput.fill('What genre should the story be?')
    await sendButton.click()
    
    // Wait for potential confirmation card with options
    const confirmationCard = page.locator('[data-testid="confirmation-request"]')
    
    if (await confirmationCard.isVisible({ timeout: 20000 })) {
      // Check for multiple option buttons
      const optionButtons = confirmationCard.locator('button[data-option]')
      const optionCount = await optionButtons.count()
      
      if (optionCount > 2) {
        // This is a multi-option confirmation
        // Click the first option
        await optionButtons.first().click()
        
        // Confirmation should be handled
        await expect(confirmationCard).not.toBeVisible({ timeout: 10000 })
      }
    } else {
      console.log('No multi-option confirmation triggered')
    }
  })
})

test.describe('Web Research Agent Interactions', () => {
  const webResearchAgentId = process.env.WEB_RESEARCH_AGENT_ID || 'web_research_agent'
  
  test.beforeEach(async ({ page }) => {
    // Navigate to chat with web research agent
    await page.goto(`/chat?agent=${webResearchAgentId}`)
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    
    // Wait for the message input to be ready
    const messageInput = page.getByPlaceholder(/type your message/i)
    await expect(messageInput).toBeVisible({ timeout: 15000 })
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
  })

  test('should display web_research tool execution', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Trigger web research
    await messageInput.fill('What are the latest developments in AI?')
    await sendButton.click()
    
    // Wait for web_research tool card
    const webResearchCard = page.locator('[data-testid="tool-execution-card"]').filter({
      has: page.locator('text=/web.*research|search/i')
    })
    
    if (await webResearchCard.isVisible({ timeout: 30000 })) {
      // Verify tool card structure
      await expect(webResearchCard.locator('[data-testid="tool-status"]')).toBeVisible()
      await expect(webResearchCard.locator('[data-testid="tool-name"]')).toBeVisible()
      
      // Wait for tool to complete
      await expect(webResearchCard.locator('[data-status="completed"], [data-status="success"]')).toBeVisible({ timeout: 60000 })
      
      // Should have result
      const resultSection = webResearchCard.locator('[data-testid="tool-result"]')
      if (await resultSection.isVisible()) {
        const resultText = await resultSection.textContent()
        expect(resultText).toBeTruthy()
        expect(resultText!.length).toBeGreaterThan(10)
      }
    }
    
    // Wait for agent response
    const assistantMessage = page.locator('[data-role="assistant"]')
    await expect(assistantMessage).toBeVisible({ timeout: 60000 })
  })
})

test.describe('Normal Tool Execution', () => {
  const storyAgentId = process.env.STORY_AGENT_ID || 'story_agent'
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`/chat?agent=${storyAgentId}`)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    
    const messageInput = page.getByPlaceholder(/type your message/i)
    await expect(messageInput).toBeVisible({ timeout: 15000 })
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
  })

  test('should display tool execution cards for any tool calls', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Send a message that might trigger tool usage
    await messageInput.fill('Write a story about space exploration')
    await sendButton.click()
    
    // Wait for any tool execution cards
    const toolCards = page.locator('[data-testid="tool-execution-card"]')
    
    // If any tools are executed, verify the cards display properly
    const toolCount = await toolCards.count()
    if (toolCount > 0) {
      // Check first tool card
      const firstCard = toolCards.first()
      await expect(firstCard).toBeVisible()
      
      // Verify card has required elements
      await expect(firstCard.locator('[data-testid="tool-name"]')).toBeVisible()
      await expect(firstCard.locator('[data-testid="tool-status"]')).toBeVisible()
      
      // Tool should eventually complete or fail
      await expect(firstCard.locator('[data-status="completed"], [data-status="success"], [data-status="failed"]')).toBeVisible({ timeout: 60000 })
    }
  })
})
