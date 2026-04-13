/**
 * Global Setup for Playwright Tests
 * 
 * Prepares the test environment before running E2E tests.
 * Ensures backend is available and test data is ready.
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Agent Console E2E tests...')
  
  // Check if backend is available
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Test backend connectivity - try multiple endpoints
    console.log('🔍 Checking Agent Engine backend availability...')
    
    let backendAvailable = false
    const testEndpoints = ['/health', '/v1/catalog/list', '/schemas/Agent']
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await page.request.get(`http://localhost:8080${endpoint}`)
        if (response.status() < 500) { // Accept any non-server-error response
          backendAvailable = true
          console.log(`✅ Agent Engine backend is available (tested ${endpoint})`)
          break
        }
      } catch (error) {
        // Continue to next endpoint
      }
    }
    
    if (!backendAvailable) {
      console.error('❌ Agent Engine backend is not available at localhost:8080')
      console.error('Please start the Agent Engine before running tests:')
      console.error('  cd agent-engine && ./gradlew bootRun')
      process.exit(1)
    }
    
    // Check if frontend is available
    console.log('🔍 Checking frontend availability...')
    const frontendResponse = await page.request.get('http://localhost:3000')
    
    if (!frontendResponse.ok()) {
      console.log('⚠️  Frontend not available, will be started by webServer config')
    } else {
      console.log('✅ Frontend is available')
    }
    
    // Verify story agent exists
    console.log('🔍 Checking for story agent...')
    try {
      const agentsResponse = await page.request.post('http://localhost:8080/v1/catalog/list', {
        data: {
          assetType: 'Agent',
          query: {}
        }
      })
      
      if (agentsResponse.ok()) {
        const result = await agentsResponse.json()
        const agents = result.items || []
        
        // Look for story_agent specifically
        const storyAgent = agents.find((agent: any) => agent.id === 'story_agent')
        
        if (storyAgent) {
          console.log(`✅ Found story agent: ${storyAgent.name} (${storyAgent.id})`)
          process.env.STORY_AGENT_ID = 'story_agent'
        } else {
          console.log('⚠️  story_agent not found, tests may fail')
          console.log('Available agents:', agents.map((a: any) => a.id).join(', '))
        }
        
        // Look for web_research_agent
        const webResearchAgent = agents.find((agent: any) => agent.id === 'web_research_agent')
        if (webResearchAgent) {
          console.log(`✅ Found web research agent: ${webResearchAgent.name} (${webResearchAgent.id})`)
          process.env.WEB_RESEARCH_AGENT_ID = 'web_research_agent'
        }
      } else {
        console.log('⚠️  Could not fetch agents from backend')
      }
    } catch (error) {
      console.log('⚠️  Error fetching agents:', error)
    }
    
    console.log('✅ Global setup completed successfully')
    
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

export default globalSetup