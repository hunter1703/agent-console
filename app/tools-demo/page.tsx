'use client'

/**
 * Tool Execution Display Demo Page
 * 
 * Showcases all agent tool execution components with different states.
 * Demonstrates unique visual identities and animations for each tool type.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SpawnAgentTool } from '@/components/chat/tools/SpawnAgentTool'
import { SendMessageTool } from '@/components/chat/tools/SendMessageTool'
import { AwaitAgentTool } from '@/components/chat/tools/AwaitAgentTool'
import { WebResearchTool } from '@/components/chat/tools/WebResearchTool'
import { ToolExecutionCard } from '@/components/chat/ToolExecutionCard'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { springPresets } from '@/lib/constants/animations'

export default function ToolsDemoPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'spawn' | 'send' | 'await' | 'research'>('all')

  // Mock data for different tool states
  const mockTools = {
    spawnPending: {
      toolCallId: '1',
      toolName: 'spawn_agent',
      parameters: {
        agent_id: 'research-assistant',
        message: 'Please research the latest developments in quantum computing',
      },
      status: 'pending' as const,
      timestamp: new Date(),
    },
    spawnExecuting: {
      toolCallId: '2',
      toolName: 'spawn_agent',
      parameters: {
        agent_id: 'code-reviewer',
        message: 'Review the authentication module for security issues',
      },
      status: 'executing' as const,
      timestamp: new Date(),
    },
    spawnCompleted: {
      toolCallId: '3',
      toolName: 'spawn_agent',
      parameters: {
        agent_id: 'data-analyst',
        message: 'Analyze the sales data from Q4 2025',
      },
      result: {
        child_session_id: 'sess_abc123def456',
      },
      status: 'completed' as const,
      timestamp: new Date(),
      duration: 1250,
    },
    spawnFailed: {
      toolCallId: '4',
      toolName: 'spawn_agent',
      parameters: {
        agent_id: 'invalid-agent',
        message: 'Test message',
      },
      result: {
        error: 'Agent "invalid-agent" not found in catalog',
      },
      status: 'failed' as const,
      timestamp: new Date(),
      duration: 450,
    },
    sendExecuting: {
      toolCallId: '5',
      toolName: 'send_message',
      parameters: {
        child_session_id: 'sess_xyz789',
        message: 'Please provide a summary of your findings',
      },
      status: 'executing' as const,
      timestamp: new Date(),
    },
    sendCompleted: {
      toolCallId: '6',
      toolName: 'send_message',
      parameters: {
        child_session_id: 'sess_xyz789',
        message: 'Continue with the next step',
      },
      result: {
        success: true,
      },
      status: 'completed' as const,
      timestamp: new Date(),
      duration: 320,
    },
    sendFailed: {
      toolCallId: '7',
      toolName: 'send_message',
      parameters: {
        child_session_id: 'sess_invalid',
        message: 'Test message',
      },
      result: {
        error: 'Session not found or already completed',
      },
      status: 'failed' as const,
      timestamp: new Date(),
      duration: 180,
    },
    awaitExecuting: {
      toolCallId: '8',
      toolName: 'await_agent',
      parameters: {
        child_session_id: 'sess_waiting123',
      },
      result: {
        status: 'waiting_for_child',
        child_session_id: 'sess_waiting123',
      },
      status: 'executing' as const,
      timestamp: new Date(),
    },
    awaitCompleted: {
      toolCallId: '9',
      toolName: 'await_agent',
      parameters: {
        child_session_id: 'sess_done456',
      },
      result: {
        status: 'completed',
        child_session_id: 'sess_done456',
        result: 'Analysis complete. Found 3 security vulnerabilities that need immediate attention.',
      },
      status: 'completed' as const,
      timestamp: new Date(),
      duration: 5420,
    },
    awaitTimeout: {
      toolCallId: '10',
      toolName: 'await_agent',
      parameters: {
        child_session_id: 'sess_timeout789',
      },
      result: {
        status: 'timeout',
        child_session_id: 'sess_timeout789',
        error: 'Child agent did not complete within 30 seconds',
      },
      status: 'failed' as const,
      timestamp: new Date(),
      duration: 30000,
    },
    researchExecuting: {
      toolCallId: '11',
      toolName: 'web_research',
      parameters: {
        query: 'latest developments in AI agents 2026',
        detailed: true,
        country: 'US',
        search_lang: 'en',
      },
      status: 'executing' as const,
      timestamp: new Date(),
    },
    researchCompleted: {
      toolCallId: '12',
      toolName: 'web_research',
      parameters: {
        query: 'best practices for React 19 server components',
        detailed: false,
      },
      result: {
        result_count: 8,
        results: [
          {
            title: 'React 19 Server Components: A Complete Guide',
            url: 'https://react.dev/blog/2025/server-components-guide',
            snippet: 'Learn how to use React Server Components effectively in your Next.js applications. This comprehensive guide covers best practices, common patterns, and performance optimization techniques.',
          },
          {
            title: 'Server Components vs Client Components in React 19',
            url: 'https://vercel.com/blog/react-19-server-client-components',
            snippet: 'Understanding the differences between Server and Client Components is crucial for building modern React applications. This article explains when to use each type.',
          },
          {
            title: 'Optimizing React Server Components for Performance',
            url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
            snippet: 'Server Components can significantly improve your application performance. Learn about streaming, suspense boundaries, and data fetching patterns.',
          },
          {
            title: 'Common Pitfalls with React Server Components',
            url: 'https://blog.logrocket.com/react-server-components-pitfalls',
            snippet: 'Avoid these common mistakes when working with Server Components. From state management to client-server boundaries, we cover the most frequent issues.',
          },
          {
            title: 'React Server Components: Real-World Examples',
            url: 'https://github.com/vercel/next.js/tree/canary/examples/app-dir-mdx',
            snippet: 'Explore practical examples of Server Components in production applications. See how leading companies are using this feature.',
          },
        ],
      },
      status: 'completed' as const,
      timestamp: new Date(),
      duration: 2340,
    },
    researchFailed: {
      toolCallId: '13',
      toolName: 'web_research',
      parameters: {
        query: 'test query',
      },
      result: {
        error: 'Search API rate limit exceeded. Please try again in 60 seconds.',
      },
      status: 'failed' as const,
      timestamp: new Date(),
      duration: 120,
    },
  }

  const tabs = [
    { id: 'all' as const, label: 'All Tools' },
    { id: 'spawn' as const, label: 'Spawn Agent' },
    { id: 'send' as const, label: 'Send Message' },
    { id: 'await' as const, label: 'Await Agent' },
    { id: 'research' as const, label: 'Web Research' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border-subtle bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">
                Tool Execution Display Demo
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Phase 8: Agent Tool Execution Components
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-subtle bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={springPresets.snappy}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* All Tools */}
        {activeTab === 'all' && (
          <div className="space-y-8">
            <Section title="Spawn Agent Tool" description="Creates new child agent sessions">
              <SpawnAgentTool {...mockTools.spawnPending} />
              <SpawnAgentTool {...mockTools.spawnExecuting} />
              <SpawnAgentTool {...mockTools.spawnCompleted} />
              <SpawnAgentTool {...mockTools.spawnFailed} />
            </Section>

            <Section title="Send Message Tool" description="Sends messages to child sessions">
              <SendMessageTool {...mockTools.sendExecuting} />
              <SendMessageTool {...mockTools.sendCompleted} />
              <SendMessageTool {...mockTools.sendFailed} />
            </Section>

            <Section title="Await Agent Tool" description="Waits for child agents to complete">
              <AwaitAgentTool {...mockTools.awaitExecuting} />
              <AwaitAgentTool {...mockTools.awaitCompleted} />
              <AwaitAgentTool {...mockTools.awaitTimeout} />
            </Section>

            <Section title="Web Research Tool" description="Searches the web for information">
              <WebResearchTool {...mockTools.researchExecuting} />
              <WebResearchTool {...mockTools.researchCompleted} />
              <WebResearchTool {...mockTools.researchFailed} />
            </Section>
          </div>
        )}

        {/* Spawn Agent Only */}
        {activeTab === 'spawn' && (
          <Section title="Spawn Agent Tool States" description="All possible states for spawn_agent tool">
            <SpawnAgentTool {...mockTools.spawnPending} />
            <SpawnAgentTool {...mockTools.spawnExecuting} />
            <SpawnAgentTool {...mockTools.spawnCompleted} />
            <SpawnAgentTool {...mockTools.spawnFailed} />
          </Section>
        )}

        {/* Send Message Only */}
        {activeTab === 'send' && (
          <Section title="Send Message Tool States" description="All possible states for send_message tool">
            <SendMessageTool {...mockTools.sendExecuting} />
            <SendMessageTool {...mockTools.sendCompleted} />
            <SendMessageTool {...mockTools.sendFailed} />
          </Section>
        )}

        {/* Await Agent Only */}
        {activeTab === 'await' && (
          <Section title="Await Agent Tool States" description="All possible states for await_agent tool">
            <AwaitAgentTool {...mockTools.awaitExecuting} />
            <AwaitAgentTool {...mockTools.awaitCompleted} />
            <AwaitAgentTool {...mockTools.awaitTimeout} />
          </Section>
        )}

        {/* Web Research Only */}
        {activeTab === 'research' && (
          <Section title="Web Research Tool States" description="All possible states for web_research tool">
            <WebResearchTool {...mockTools.researchExecuting} />
            <WebResearchTool {...mockTools.researchCompleted} />
            <WebResearchTool {...mockTools.researchFailed} />
          </Section>
        )}
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.default}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}
