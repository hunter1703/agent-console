'use client'

/**
 * Chat Page
 * 
 * Chat interface for interacting with a specific agent.
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { getAgent, type Agent } from '@/lib/api/services'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.agentId as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    loadAgent()
  }, [agentId])

  const loadAgent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const agentData = await getAgent(agentId)
      setAgent(agentData)
    } catch (err) {
      console.error('Failed to load agent:', err)
      setError(err instanceof Error ? err.message : 'Failed to load agent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return

    const userMessage = message.trim()
    setMessage('')
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    setIsSending(true)
    
    try {
      // TODO: Implement actual API call to invoke agent
      // For now, just echo back
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Echo from ${agent?.name}: ${userMessage}`
        }
      ])
    } catch (err) {
      console.error('Failed to send message:', err)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your message.'
        }
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse mx-auto mb-4" />
          <p className="text-text-secondary">Loading agent...</p>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Agent Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">{error || 'The requested agent could not be found.'}</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => router.push('/')}
            >
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {agent.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-text-primary">{agent.name}</h1>
                {agent.description && (
                  <p className="text-xs text-text-tertiary">{agent.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-text-secondary">
                Send a message to {agent.name} to begin
              </p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex gap-4',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-[70%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-surface border border-border-subtle'
                    )}
                  >
                    <p className={cn(
                      'text-sm whitespace-pre-wrap',
                      msg.role === 'user' ? 'text-white' : 'text-text-primary'
                    )}>
                      {msg.content}
                    </p>
                  </div>
                  
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center flex-shrink-0">
                      <span className="text-text-primary font-semibold text-sm">U</span>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isSending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-surface border border-border-subtle rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-text-tertiary animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-text-tertiary animate-pulse delay-75" />
                      <div className="w-2 h-2 rounded-full bg-text-tertiary animate-pulse delay-150" />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border-subtle bg-surface/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              className="flex-1"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              icon={<Send size={16} />}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
