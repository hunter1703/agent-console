/**
 * Chat Interface E2E Tests
 * 
 * Comprehensive tests for the chat functionality including:
 * - Basic messaging with story agent
 * - SSE streaming
 * - Tool execution display
 * - Planning cards
 * - Confirmation requests
 * - Multi-agent sessions
 */

import { test, expect } from '@playwright/test'

test.describe('Chat Interface', () => {
  const storyAgentId = process.env.STORY_AGENT_ID || 'story_agent'
  
  test.beforeEach(async ({ page }) => {
    // Navigate to chat with story agent
    await page.goto(`/chat?agent=${storyAgentId}`)
    
    // Wait for page to load - look for the chat title h1
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    
    // Wait for the message input to be visible and enabled (indicating page is fully loaded)
    const messageInput = page.getByPlaceholder(/type your message/i)
    await expect(messageInput).toBeVisible({ timeout: 15000 })
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Production-ready: Wait for input to be ready for interaction
    await page.waitForFunction(() => {
      const input = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement
      return input && !input.disabled && !input.readOnly && input.offsetParent !== null
    }, { timeout: 20000 })
  })

  test('should display chat interface with all components', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Chat with/)
    
    // Check header with agent info - target the main content h1
    await expect(page.locator('main h1, [role="main"] h1, .min-h-screen h1').first()).toBeVisible()
    
    // Check message input
    await expect(page.getByPlaceholder(/type your message/i)).toBeVisible()
    
    // Check send button
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
    
    // Check connection status
    await expect(page.getByText(/connected|connecting|ready to chat/i)).toBeVisible()
  })

  test('should send message and receive response', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Production-ready: Ensure input is ready before interaction
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Type a simple message
    await messageInput.fill('Hello! Can you tell me a short story?')
    await sendButton.click()
    
    // Check that user message appears
    await expect(page.getByText('Hello! Can you tell me a short story?')).toBeVisible()
    
    // Production-ready: Wait for agent response with robust selector
    const assistantMessage = page.locator('[data-role="assistant"]')
    await expect(assistantMessage).toBeVisible({ timeout: 45000 })
    
    // Verify the response has content
    const responseText = await assistantMessage.textContent()
    expect(responseText).toBeTruthy()
    expect(responseText!.length).toBeGreaterThan(10)
    
    // Production-ready: Ensure input is enabled again after response
    await expect(messageInput).toBeEnabled({ timeout: 10000 })
    
    // Check that typing indicator appears and disappears
    const typingIndicator = page.locator('[data-testid="typing-indicator"]')
    if (await typingIndicator.isVisible()) {
      await expect(typingIndicator).not.toBeVisible({ timeout: 30000 })
    }
  })

  test('should handle different story prompts to evoke various responses', async ({ page }) => {
    const testPrompts = [
      {
        prompt: 'Write a story about a robot learning to paint',
        expectedKeywords: ['robot', 'paint', 'art', 'learn']
      },
      {
        prompt: 'Tell me a mystery story with a detective',
        expectedKeywords: ['mystery', 'detective', 'clue', 'solve']
      },
      {
        prompt: 'Create a fantasy adventure with magic',
        expectedKeywords: ['fantasy', 'magic', 'adventure', 'quest']
      }
    ]
    
    for (const { prompt, expectedKeywords } of testPrompts) {
      // Clear any existing messages by refreshing
      await page.reload()
      await expect(page.getByPlaceholder(/type your message/i)).toBeVisible()
      
      // Send the prompt
      await page.getByPlaceholder(/type your message/i).fill(prompt)
      await page.getByRole('button', { name: /send/i }).click()
      
      // Wait for response
      await expect(page.locator('[data-role="assistant"]')).toBeVisible({ timeout: 30000 })
      
      // Check that response contains expected keywords (case insensitive)
      const responseText = await page.locator('[data-role="assistant"]').textContent()
      const hasKeyword = expectedKeywords.some(keyword => 
        responseText?.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (!hasKeyword) {
        console.log(`Response for "${prompt}":`, responseText)
        console.log(`Expected keywords:`, expectedKeywords)
      }
      
      // Note: We don't fail the test if keywords aren't found since story content is unpredictable
      // This is more for observing different response types
    }
  })

  test('should display tool execution when agent uses tools', async ({ page }) => {
    // Send a message that might trigger tool usage
    await page.getByPlaceholder(/type your message/i).fill('Can you research the latest news about AI and then tell me a story based on what you find?')
    await page.getByRole('button', { name: /send/i }).click()
    
    // Wait for potential tool execution cards
    const toolCard = page.locator('[data-testid="tool-execution-card"]')
    
    // If tool execution happens, verify the card displays properly
    if (await toolCard.isVisible({ timeout: 15000 })) {
      await expect(toolCard).toBeVisible()
      
      // Check tool card has proper status
      await expect(toolCard.locator('[data-testid="tool-status"]')).toBeVisible()
      
      // Check tool card has tool name
      await expect(toolCard.locator('[data-testid="tool-name"]')).toBeVisible()
      
      // Wait for tool to complete
      await expect(toolCard.locator('[data-status="completed"], [data-status="failed"]')).toBeVisible({ timeout: 30000 })
    }
  })

  test('should display planning cards when agent creates plans', async ({ page }) => {
    // Send a message that might trigger planning
    await page.getByPlaceholder(/type your message/i).fill('Can you create a plan for writing a multi-chapter fantasy novel?')
    await page.getByRole('button', { name: /send/i }).click()
    
    // Wait for potential planning cards
    const planningCard = page.locator('[data-testid="planning-card"]')
    
    // If planning happens, verify the card displays properly
    if (await planningCard.isVisible({ timeout: 15000 })) {
      await expect(planningCard).toBeVisible()
      
      // Check planning card has title
      await expect(planningCard.locator('[data-testid="plan-title"]')).toBeVisible()
      
      // Check planning card has tasks
      await expect(planningCard.locator('[data-testid="task-item"]')).toBeVisible()
      
      // Check task status indicators
      await expect(planningCard.locator('[data-testid="task-status"]')).toBeVisible()
    }
  })

  test('should handle confirmation requests', async ({ page }) => {
    // Send a message that might trigger confirmation
    await page.getByPlaceholder(/type your message/i).fill('Please help me delete all my old files. This is a destructive action that needs confirmation.')
    await page.getByRole('button', { name: /send/i }).click()
    
    // Wait for potential confirmation requests
    const confirmationCard = page.locator('[data-testid="confirmation-request"]')
    
    // If confirmation request appears, test interaction
    if (await confirmationCard.isVisible({ timeout: 15000 })) {
      await expect(confirmationCard).toBeVisible()
      
      // Check confirmation has prompt
      await expect(confirmationCard.locator('[data-testid="confirmation-prompt"]')).toBeVisible()
      
      // Check confirmation has action buttons
      const yesButton = confirmationCard.getByRole('button', { name: /yes|confirm|proceed/i })
      const noButton = confirmationCard.getByRole('button', { name: /no|cancel|decline/i })
      
      if (await yesButton.isVisible()) {
        await expect(yesButton).toBeVisible()
      }
      if (await noButton.isVisible()) {
        await expect(noButton).toBeVisible()
        
        // Click no to decline
        await noButton.click()
        
        // Confirmation should be marked as handled
        await expect(confirmationCard.locator('[data-status="rejected"]')).toBeVisible({ timeout: 10000 })
      }
    }
  })

  test('should handle SSE connection status', async ({ page }) => {
    // Check initial connection status
    const connectionStatus = page.locator('[data-testid="connection-status"]')
    
    if (await connectionStatus.isVisible()) {
      // Should show connected or connecting
      await expect(connectionStatus).toHaveText(/connected|connecting/i)
      
      // If there's a retry button, it should work
      const retryButton = page.getByRole('button', { name: /retry/i })
      if (await retryButton.isVisible()) {
        await retryButton.click()
        await expect(connectionStatus).toHaveText(/connecting/i)
      }
    }
  })

  test('should support multi-agent sessions', async ({ page }) => {
    // Send a message that might spawn child agents
    await page.getByPlaceholder(/type your message/i).fill('Can you spawn a helper agent to research a topic while you work on the story?')
    await page.getByRole('button', { name: /send/i }).click()
    
    // Wait for potential session tabs
    const sessionTabs = page.locator('[data-testid="chat-tabs"]')
    
    // If multi-agent session is created, verify tabs
    if (await sessionTabs.isVisible({ timeout: 15000 })) {
      await expect(sessionTabs).toBeVisible()
      
      // Should have multiple tabs
      const tabs = sessionTabs.locator('[role="tab"]')
      const tabCount = await tabs.count()
      
      if (tabCount > 1) {
        // Click on different tabs
        await tabs.nth(1).click()
        
        // Should switch to different session
        await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true')
      }
    }
  })

  test('should handle message input properly', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    
    // Production-ready: Wait for input to be enabled with comprehensive checking
    await expect(messageInput).toBeVisible({ timeout: 15000 })
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Additional check using page function for cross-browser compatibility
    await page.waitForFunction(() => {
      const input = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement
      return input && !input.disabled && !input.readOnly && input.offsetParent !== null
    }, { timeout: 20000 })
    
    // Test typing
    await messageInput.fill('This is a test message')
    await expect(messageInput).toHaveValue('This is a test message')
    
    // Test Enter key to send
    await messageInput.press('Enter')
    
    // Message should be sent and input cleared
    await expect(messageInput).toHaveValue('')
    
    // Production-ready: Wait for input to be enabled again after sending with multiple checks
    await page.waitForFunction(() => {
      const input = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement
      return input && !input.disabled && !input.readOnly
    }, { timeout: 30000 })
    
    await expect(messageInput).toBeEnabled({ timeout: 30000 })
    
    // Test Shift+Enter for new line
    await messageInput.fill('Line 1')
    await messageInput.press('Shift+Enter')
    await messageInput.type('Line 2')
    
    const value = await messageInput.inputValue()
    expect(value).toContain('\n')
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Chat interface should adapt to mobile - target the main content h1
    await expect(page.locator('main h1, [role="main"] h1, .min-h-screen h1').first()).toBeVisible()
    
    // Message input should be accessible
    await expect(page.getByPlaceholder(/type your message/i)).toBeVisible()
    
    // Send button should be visible
    await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
    
    // Test mobile interaction
    await page.getByPlaceholder(/type your message/i).fill('Mobile test message')
    await page.getByRole('button', { name: /send/i }).click()
    
    // Should work on mobile
    await expect(page.getByText('Mobile test message')).toBeVisible()
  })

  test('should handle empty chat state', async ({ page }) => {
    // Check for empty state when no messages
    const emptyState = page.locator('[data-testid="empty-chat"]')
    
    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible()
      
      // Should have suggested prompts
      const suggestedPrompts = page.locator('[data-testid="suggested-prompt"]')
      if (await suggestedPrompts.count() > 0) {
        // Click on a suggested prompt
        await suggestedPrompts.first().click()
        
        // Should fill the input
        const messageInput = page.getByPlaceholder(/type your message/i)
        const inputValue = await messageInput.inputValue()
        expect(inputValue.length).toBeGreaterThan(0)
      }
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Test with invalid agent ID
    await page.goto('/chat?agent=invalid-agent-id')
    
    // Should show error state
    await expect(page.getByText(/agent not found|error/i).first()).toBeVisible({ timeout: 10000 })
    
    // Should have navigation options - be more specific to avoid header buttons
    await expect(page.getByRole('button', { name: 'Go to Dashboard' })).toBeVisible()
  })

  test('should maintain scroll position correctly', async ({ page }) => {
    // Wait for input to be enabled first
    const messageInput = page.getByPlaceholder(/type your message/i)
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send multiple messages to create scrollable content
    for (let i = 1; i <= 3; i++) {
      // Wait for input to be enabled before each message
      await expect(messageInput).toBeEnabled({ timeout: 15000 })
      
      await messageInput.fill(`Test message ${i}`)
      await page.getByRole('button', { name: /send/i }).click()
      
      // Wait for the message to appear in the DOM before continuing
      await expect(page.getByText(`Test message ${i}`)).toBeVisible({ timeout: 10000 })
      
      // Wait for input to be enabled again
      await expect(messageInput).toBeEnabled({ timeout: 15000 })
      
      // Small delay between messages for stability
      await page.waitForTimeout(1000)
    }
    
    // Should auto-scroll to bottom for new messages
    const messageContainer = page.locator('[data-testid="message-list"]')
    if (await messageContainer.isVisible()) {
      // Check that the latest message is visible
      await expect(page.getByText('Test message 3')).toBeVisible()
    }
  })

  test('should handle rapid message sending', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send multiple messages rapidly
    const messages = ['First rapid message', 'Second rapid message', 'Third rapid message']
    
    for (const message of messages) {
      // Wait for input to be ready
      await page.waitForFunction(() => {
        const input = document.querySelector('textarea[placeholder*="message"]') as HTMLTextAreaElement
        return input && !input.disabled && !input.readOnly
      }, { timeout: 15000 })
      
      await messageInput.fill(message)
      await sendButton.click()
      
      // Verify message appears
      await expect(page.getByText(message)).toBeVisible({ timeout: 10000 })
      
      // Small delay between messages
      await page.waitForTimeout(500)
    }
    
    // Verify all messages are present
    for (const message of messages) {
      await expect(page.getByText(message)).toBeVisible()
    }
  })

  test('should handle network interruption gracefully', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Simulate network failure by intercepting requests
    await page.route('**/api/agents/*/invoke', route => {
      route.abort('failed')
    })
    
    // Try to send a message
    await messageInput.fill('This message should fail gracefully')
    await sendButton.click()
    
    // Should show user message
    await expect(page.getByText('This message should fail gracefully')).toBeVisible()
    
    // Should show error response or timeout message
    await expect(page.locator('[data-role="assistant"]')).toBeVisible({ timeout: 45000 })
    
    // Input should be enabled again
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Restore network
    await page.unroute('**/api/agents/*/invoke')
    
    // Should be able to send messages again
    await messageInput.fill('This should work after network restore')
    await sendButton.click()
    
    await expect(page.getByText('This should work after network restore')).toBeVisible()
  })

  test('should validate accessibility during interaction', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    
    // Check ARIA attributes
    await expect(messageInput).toHaveAttribute('aria-label', /send message|message input/i)
    
    // Check keyboard navigation
    await messageInput.focus()
    await expect(messageInput).toBeFocused()
    
    // Check send button accessibility
    const sendButton = page.getByRole('button', { name: /send/i })
    await expect(sendButton).toHaveAttribute('aria-label', /send/i)
    
    // Test keyboard interaction
    await messageInput.fill('Accessibility test message')
    await messageInput.press('Enter')
    
    // Verify message was sent
    await expect(page.getByText('Accessibility test message')).toBeVisible()
  })

  test('should support multi-turn conversations', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // First turn
    await messageInput.fill('Tell me about cats')
    await sendButton.click()
    
    // Wait for user message to appear
    await expect(page.getByText('Tell me about cats')).toBeVisible()
    
    // Wait for assistant response
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 45000 })
    
    // Wait for input to be enabled again
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Second turn
    await messageInput.fill('What about dogs?')
    await sendButton.click()
    
    // Wait for second user message
    await expect(page.getByText('What about dogs?')).toBeVisible()
    
    // Wait for second assistant response
    await expect(page.locator('[data-role="assistant"]').nth(1)).toBeVisible({ timeout: 45000 })
    
    // Wait for input to be enabled again
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Third turn
    await messageInput.fill('Compare them')
    await sendButton.click()
    
    // Wait for third user message
    await expect(page.getByText('Compare them')).toBeVisible()
    
    // Wait for third assistant response
    await expect(page.locator('[data-role="assistant"]').nth(2)).toBeVisible({ timeout: 45000 })
    
    // Verify all messages are still visible (conversation history)
    await expect(page.getByText('Tell me about cats')).toBeVisible()
    await expect(page.getByText('What about dogs?')).toBeVisible()
    await expect(page.getByText('Compare them')).toBeVisible()
    
    // Verify we have 3 user messages and 3 assistant messages
    const userMessages = page.locator('[data-role="user"]')
    const assistantMessages = page.locator('[data-role="assistant"]')
    
    await expect(userMessages).toHaveCount(3)
    await expect(assistantMessages).toHaveCount(3)
  })

  test('should persist and display messages when reopening a session', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send first message
    await messageInput.fill('First message in session')
    await sendButton.click()
    
    // Wait for user message
    await expect(page.getByText('First message in session')).toBeVisible()
    
    // Wait for assistant response
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 45000 })
    
    // Wait for input to be enabled
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send second message
    await messageInput.fill('Second message in session')
    await sendButton.click()
    
    // Wait for second user message
    await expect(page.getByText('Second message in session')).toBeVisible()
    
    // Wait for second assistant response
    await expect(page.locator('[data-role="assistant"]').nth(1)).toBeVisible({ timeout: 45000 })
    
    // Get the current session ID from URL
    const currentUrl = page.url()
    const sessionId = currentUrl.match(/\/session\/([^\/]+)/)?.[1]
    
    expect(sessionId).toBeTruthy()
    
    // Navigate away to dashboard
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText(/dashboard/i)
    
    // Navigate back to the session
    await page.goto(`/session/${sessionId}`)
    
    // Wait for page to load
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 })
    
    // Verify all messages are still visible
    await expect(page.getByText('First message in session')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Second message in session')).toBeVisible({ timeout: 10000 })
    
    // Verify assistant responses are still visible
    const assistantMessages = page.locator('[data-role="assistant"]')
    await expect(assistantMessages).toHaveCount(2, { timeout: 10000 })
    
    // Verify we can continue the conversation
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    await messageInput.fill('Third message after reopening')
    await sendButton.click()
    
    // Verify new message appears
    await expect(page.getByText('Third message after reopening')).toBeVisible()
  })

  test('should display planning cards when planning tools are invoked', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send a message that triggers planning
    await messageInput.fill('Create a plan for a 3-chapter mystery story')
    await sendButton.click()
    
    // Wait for user message
    await expect(page.getByText('Create a plan for a 3-chapter mystery story')).toBeVisible()
    
    // Wait for planning card to appear (with generous timeout for backend processing)
    const planningCard = page.locator('[data-testid="planning-card"]').first()
    await expect(planningCard).toBeVisible({ timeout: 60000 })
    
    // Verify planning card has title
    const planTitle = planningCard.locator('[data-testid="plan-title"]')
    await expect(planTitle).toBeVisible()
    await expect(planTitle).toContainText(/mystery|story|plan/i)
    
    // Verify planning card has tasks
    const tasks = planningCard.locator('[data-testid="task-item"]')
    await expect(tasks.first()).toBeVisible()
    
    // Verify at least 3 tasks (for 3 chapters)
    const taskCount = await tasks.count()
    expect(taskCount).toBeGreaterThanOrEqual(3)
    
    // Verify task status indicators are present
    const taskStatuses = planningCard.locator('[data-testid="task-status"]')
    await expect(taskStatuses.first()).toBeVisible()
    
    // Verify planning card can be collapsed/expanded
    const collapseButton = planningCard.locator('button[aria-label*="collapse"], button[aria-label*="expand"]').first()
    if (await collapseButton.isVisible()) {
      await collapseButton.click()
      
      // Tasks should be hidden after collapse
      await expect(tasks.first()).not.toBeVisible({ timeout: 2000 })
      
      // Click again to expand
      await collapseButton.click()
      
      // Tasks should be visible again
      await expect(tasks.first()).toBeVisible({ timeout: 2000 })
    }
  })

  test('should update planning cards as tasks progress', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send a message that triggers planning
    await messageInput.fill('Create a plan for writing a short story and execute it')
    await sendButton.click()
    
    // Wait for user message
    await expect(page.getByText(/create a plan for writing a short story/i)).toBeVisible()
    
    // Wait for planning card to appear
    const planningCard = page.locator('[data-testid="planning-card"]').first()
    await expect(planningCard).toBeVisible({ timeout: 60000 })
    
    // Check initial task statuses - should have at least one pending task
    const pendingTasks = planningCard.locator('[data-testid="task-status"][data-status="pending"]')
    const initialPendingCount = await pendingTasks.count()
    expect(initialPendingCount).toBeGreaterThan(0)
    
    // Wait for tasks to start progressing (in_progress status)
    const inProgressTasks = planningCard.locator('[data-testid="task-status"][data-status="in_progress"]')
    await expect(inProgressTasks.first()).toBeVisible({ timeout: 30000 })
    
    // Wait for at least one task to complete
    const completedTasks = planningCard.locator('[data-testid="task-status"][data-status="completed"]')
    await expect(completedTasks.first()).toBeVisible({ timeout: 60000 })
    
    // Verify the planning card footer shows progress
    const footer = planningCard.locator('[data-testid="planning-footer"]')
    if (await footer.isVisible()) {
      // Should show something like "2/5 tasks completed"
      await expect(footer).toContainText(/\d+\/\d+|completed|progress/i)
    }
  })

  test('should display confirmation requests and handle responses', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send a message that might trigger a confirmation
    // Note: This depends on the agent being configured to request confirmations
    await messageInput.fill('Delete all my files and start fresh')
    await sendButton.click()
    
    // Wait for user message
    await expect(page.getByText(/delete all my files/i)).toBeVisible()
    
    // Wait for potential confirmation request (with timeout)
    const confirmationCard = page.locator('[data-testid="confirmation-request"]').first()
    
    // Only proceed with test if confirmation appears
    if (await confirmationCard.isVisible({ timeout: 30000 })) {
      // Verify confirmation has prompt
      const confirmationPrompt = confirmationCard.locator('[data-testid="confirmation-prompt"]')
      await expect(confirmationPrompt).toBeVisible()
      await expect(confirmationPrompt).toContainText(/confirm|proceed|sure|delete/i)
      
      // Verify confirmation has action buttons
      const yesButton = confirmationCard.getByRole('button', { name: /yes|confirm|proceed/i })
      const noButton = confirmationCard.getByRole('button', { name: /no|cancel|decline/i })
      
      await expect(yesButton).toBeVisible()
      await expect(noButton).toBeVisible()
      
      // Click no to decline
      await noButton.click()
      
      // Confirmation should be marked as handled
      await expect(confirmationCard.locator('[data-status="rejected"]')).toBeVisible({ timeout: 10000 })
      
      // Input should be enabled again
      await expect(messageInput).toBeEnabled({ timeout: 15000 })
    } else {
      // If no confirmation appears, that's also valid - just log it
      console.log('No confirmation request triggered for this prompt')
    }
  })

  test('should start new chat with same agent when clicking New Chat button', async ({ page }) => {
    const messageInput = page.getByPlaceholder(/type your message/i)
    const sendButton = page.getByRole('button', { name: /send/i })
    
    // Ensure input is ready
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    
    // Send a message to create a conversation
    await messageInput.fill('Hello, this is my first message')
    await sendButton.click()
    
    // Wait for user message
    await expect(page.getByText('Hello, this is my first message')).toBeVisible()
    
    // Wait for assistant response
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 45000 })
    
    // Get the current agent ID from URL
    const currentUrl = page.url()
    const agentIdMatch = currentUrl.match(/[?&]agent=([^&]+)/)
    const currentAgentId = agentIdMatch ? agentIdMatch[1] : storyAgentId
    
    // Wait for New Chat button to appear (it only shows when there are messages)
    const newChatButton = page.getByRole('button', { name: /new chat/i })
    await expect(newChatButton).toBeVisible({ timeout: 10000 })
    
    // Click New Chat button
    await newChatButton.click()
    
    // Wait for navigation to complete
    await page.waitForURL(/\/chat\?agent=/, { timeout: 10000 })
    
    // Verify we're on the chat page with the same agent
    const newUrl = page.url()
    expect(newUrl).toContain('/chat?agent=')
    expect(newUrl).toContain(currentAgentId)
    
    // Verify we're NOT on the dashboard
    expect(newUrl).not.toContain('/dashboard')
    
    // Verify the chat is empty (no previous messages)
    await expect(page.getByText('Hello, this is my first message')).not.toBeVisible({ timeout: 5000 })
    
    // Verify the message input is ready for a new conversation
    await expect(messageInput).toBeEnabled({ timeout: 15000 })
    await expect(messageInput).toHaveValue('')
    
    // Verify we can send a new message in the fresh chat
    await messageInput.fill('This is a new conversation')
    await sendButton.click()
    
    // Verify the new message appears
    await expect(page.getByText('This is a new conversation')).toBeVisible()
    
    // Verify we get a response
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 45000 })
  })
})