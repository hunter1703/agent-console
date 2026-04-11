'use client'

/**
 * Phase 7 Chat Components Demo Page
 * 
 * Showcases all Phase 7 chat interface components for visual testing and evaluation.
 */

import { useState } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { ChatTabs } from '@/components/chat/ChatTabs'
import { MessageList } from '@/components/chat/MessageList'
import { MessageInput } from '@/components/chat/MessageInput'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { EmptyState } from '@/components/chat/EmptyState'
import { PullToRefresh } from '@/components/chat/PullToRefresh'
import { ThemeToggle } from '@/components/common'

// Mock data
const mockMessages = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    sender: 'agent' as const,
    senderName: 'AI Assistant',
    timestamp: new Date(Date.now() - 10000),
    onCopy: () => console.log('Copy message 1'),
    onDelete: () => console.log('Delete message 1'),
  },
  {
    id: '2',
    content: 'I need help with my project',
    sender: 'user' as const,
    senderName: 'John Doe',
    timestamp: new Date(Date.now() - 8000),
    onCopy: () => console.log('Copy message 2'),
    onDelete: () => console.log('Delete message 2'),
  },
  {
    id: '3',
    content: 'Of course! What kind of project are you working on?',
    sender: 'agent' as const,
    senderName: 'AI Assistant',
    timestamp: new Date(Date.now() - 6000),
    onCopy: () => console.log('Copy message 3'),
    onRegenerate: () => console.log('Regenerate message 3'),
    onDelete: () => console.log('Delete message 3'),
  },
  {
    id: '4',
    content: 'It\'s a web application using React and TypeScript',
    sender: 'user' as const,
    senderName: 'John Doe',
    timestamp: new Date(Date.now() - 4000),
    onCopy: () => console.log('Copy message 4'),
    onDelete: () => console.log('Delete message 4'),
  },
  {
    id: '5',
    content: 'Great! React and TypeScript are excellent choices. What specific aspect would you like help with?',
    sender: 'agent' as const,
    senderName: 'AI Assistant',
    timestamp: new Date(Date.now() - 2000),
    onCopy: () => console.log('Copy message 5'),
    onRegenerate: () => console.log('Regenerate message 5'),
    onDelete: () => console.log('Delete message 5'),
  },
]

const mockTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'session-1', label: 'Session 1' },
  { id: 'session-2', label: 'Session 2' },
  { id: 'session-3', label: 'Session 3' },
]

export default function ChatDemoPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [messages, setMessages] = useState(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmpty, setShowEmpty] = useState(false)

  const handleSend = (message: string) => {
    const newMessage = {
      id: String(messages.length + 1),
      content: message,
      sender: 'user' as const,
      senderName: 'John Doe',
      timestamp: new Date(),
      onCopy: () => console.log(`Copy message ${messages.length + 1}`),
      onDelete: () => console.log(`Delete message ${messages.length + 1}`),
    }

    setMessages([...messages, newMessage])

    // Simulate agent typing
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const agentMessage = {
        id: String(messages.length + 2),
        content: 'That\'s a great question! Let me help you with that.',
        sender: 'agent' as const,
        senderName: 'AI Assistant',
        timestamp: new Date(),
        onCopy: () => console.log(`Copy message ${messages.length + 2}`),
        onRegenerate: () => console.log(`Regenerate message ${messages.length + 2}`),
        onDelete: () => console.log(`Delete message ${messages.length + 2}`),
      }
      setMessages(prev => [...prev, agentMessage])
    }, 2000)
  }

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Refreshed messages')
  }

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b border-border-subtle bg-surface z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Phase 7 Chat Demo</h1>
            <p className="text-sm text-text-secondary mt-1">
              Testing all chat interface components
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowEmpty(!showEmpty)}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {showEmpty ? 'Show Messages' : 'Show Empty State'}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Chat Interface - fills remaining space */}
      <div className="flex-1 overflow-hidden">
        <PullToRefresh onRefresh={handleRefresh}>
          <ChatInterface
            tabs={
              <ChatTabs
                tabs={mockTabs}
                activeTabId={activeTab}
                onTabClick={setActiveTab}
              />
            }
            messages={
              showEmpty ? undefined : (
                <>
                  <MessageList messages={messages} />
                  {isTyping && (
                    <div className="mt-6">
                      <TypingIndicator />
                    </div>
                  )}
                </>
              )
            }
            emptyState={
              showEmpty ? (
                <EmptyState onPromptClick={handlePromptClick} />
              ) : undefined
            }
            input={
              <MessageInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                isStreaming={isTyping}
              />
            }
          />
        </PullToRefresh>
      </div>

      {/* Component Status Panel - Fixed */}
      <div className="fixed bottom-4 left-4 bg-surface border border-border-subtle rounded-lg shadow-lg p-4 max-w-xs z-30">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Component Status</h3>
        <div className="space-y-1 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>ChatInterface</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>ChatTabs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Message</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>MessageList</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>MessageInput</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>TypingIndicator</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>EmptyState</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>PullToRefresh</span>
          </div>
        </div>
      </div>
    </div>
  )
}
