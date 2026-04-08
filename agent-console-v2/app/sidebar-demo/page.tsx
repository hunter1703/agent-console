'use client'

/**
 * Sidebar Demo Page
 * 
 * Comprehensive demo of sidebar components with real backend data.
 * Tests all interactions, animations, and visual design.
 */

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Sidebar, SidebarToggle, AgentList, SessionList, ThemeToggle } from '@/components/sidebar'
import type { SidebarView, Agent, Session } from '@/components/sidebar'
import { Button } from '@/components/common/Button'
import { apiClient } from '@/lib/api'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'

export default function SidebarDemoPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeView, setActiveView] = useState<SidebarView>('agents')
  const [agents, setAgents] = useState<Agent[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string>()
  const [activeSessionId, setActiveSessionId] = useState<string>()
  const [isLoadingAgents, setIsLoadingAgents] = useState(false)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [error, setError] = useState<string>()

  const isMobile = useMediaQuery('(max-width: 767px)')

  // Fetch agents
  const fetchAgents = async () => {
    setIsLoadingAgents(true)
    setError(undefined)
    try {
      const data = await apiClient.listAgents()
      setAgents(data)
    } catch (err: any) {
      console.error('Failed to fetch agents:', err)
      setError(err.message || 'Failed to load agents')
      // Use mock data for demo
      setAgents([
        {
          id: '1',
          name: 'Code Assistant',
          description: 'Helps with coding tasks, debugging, and code reviews',
          avatarUrl: undefined,
        },
        {
          id: '2',
          name: 'Research Agent',
          description: 'Conducts research and summarizes information',
          avatarUrl: undefined,
        },
        {
          id: '3',
          name: 'Writing Coach',
          description: 'Assists with writing, editing, and content creation',
          avatarUrl: undefined,
        },
      ])
    } finally {
      setIsLoadingAgents(false)
    }
  }

  const fetchSessions = async () => {
    setIsLoadingSessions(true)
    setError(undefined)
    try {
      const data = await apiClient.listSessions()
      setSessions(data)
    } catch (err: any) {
      console.error('Failed to fetch sessions:', err)
      setError(err.message || 'Failed to load sessions')
      // Use mock data for demo
      setSessions([
        {
          id: '1',
          agentName: 'Code Assistant',
          agentAvatarUrl: undefined,
          lastMessage: 'Can you help me debug this React component?',
          lastActivity: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        },
        {
          id: '2',
          agentName: 'Research Agent',
          agentAvatarUrl: undefined,
          lastMessage: 'What are the latest trends in AI?',
          lastActivity: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          parentSessionId: undefined,
        },
        {
          id: '3',
          agentName: 'Code Assistant',
          agentAvatarUrl: undefined,
          lastMessage: 'Follow-up on the debugging session',
          lastActivity: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
          parentSessionId: '1',
        },
      ])
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // Fetch data on mount and when view changes
  useEffect(() => {
    if (activeView === 'agents') {
      fetchAgents()
    } else if (activeView === 'chats') {
      fetchSessions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView])

  const handleAgentClick = (agentId: string) => {
    setActiveAgentId(agentId)
    console.log('Selected agent:', agentId)
  }

  const handleAgentEdit = (agentId: string) => {
    console.log('Edit agent:', agentId)
  }

  const handleAgentDelete = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await apiClient.deleteAgent(agentId)
        setAgents(agents.filter(a => a.id !== agentId))
      } catch (err: any) {
        console.error('Failed to delete agent:', err)
        // For demo, just remove from list
        setAgents(agents.filter(a => a.id !== agentId))
      }
    }
  }

  const handleSessionClick = (sessionId: string) => {
    setActiveSessionId(sessionId)
    console.log('Selected session:', sessionId)
  }

  const handleSessionDelete = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await apiClient.deleteSession(sessionId)
        setSessions(sessions.filter(s => s.id !== sessionId))
      } catch (err: any) {
        console.error('Failed to delete session:', err)
        // For demo, just remove from list
        setSessions(sessions.filter(s => s.id !== sessionId))
      }
    }
  }

  const handleCreateAgent = () => {
    console.log('Create new agent')
  }

  const handleCreateSession = () => {
    console.log('Create new session')
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        header={
          <div className="space-y-4">
            {/* Logo/Title */}
            <h1 className="text-xl font-bold text-text-primary">
              Agent Console
            </h1>

            {/* View Toggle */}
            <SidebarToggle
              activeView={activeView}
              onViewChange={setActiveView}
            />

            {/* Create Button */}
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={activeView === 'agents' ? handleCreateAgent : handleCreateSession}
              className="w-full"
            >
              {activeView === 'agents' ? 'New Agent' : 'New Chat'}
            </Button>
          </div>
        }
        footer={
          <ThemeToggle />
        }
      >
        {/* Content */}
        <>
          {activeView === 'agents' ? (
            <AgentList
              agents={agents}
              activeAgentId={activeAgentId}
              isLoading={isLoadingAgents}
              onAgentClick={handleAgentClick}
              onAgentEdit={handleAgentEdit}
              onAgentDelete={handleAgentDelete}
              onCreateAgent={handleCreateAgent}
            />
          ) : (
            <SessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              isLoading={isLoadingSessions}
              onSessionClick={handleSessionClick}
              onSessionDelete={handleSessionDelete}
              onCreateSession={handleCreateSession}
            />
          )}
        </>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-surface/30">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.h1 
              className="text-5xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Sidebar Demo
            </motion.h1>
            <motion.p 
              className="text-lg text-text-secondary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Testing sidebar components with real backend integration
            </motion.p>
          </div>

          {error && (
            <motion.div 
              className="p-4 bg-error/10 border-2 border-error/20 rounded-xl text-error text-sm backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {/* Features Card */}
            <motion.div 
              className="p-6 bg-surface/80 backdrop-blur-xl border-2 border-border-subtle rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Features
              </h3>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Real backend API integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Agent list with magnetic hover</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Session list with hierarchy</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Loading states with skeletons</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Empty states with CTAs</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Responsive mobile overlay</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Theme toggle with animations</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Smooth spring animations</span>
                </li>
              </ul>
            </motion.div>

            {/* Test Actions Card */}
            <motion.div 
              className="p-6 bg-surface/80 backdrop-blur-xl border-2 border-border-subtle rounded-2xl shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                Test Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="w-full"
                >
                  {isSidebarOpen ? 'Close' : 'Open'} Sidebar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setActiveView(activeView === 'agents' ? 'chats' : 'agents')}
                  className="w-full"
                >
                  Switch to {activeView === 'agents' ? 'Chats' : 'Agents'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => activeView === 'agents' ? fetchAgents() : fetchSessions()}
                  className="w-full"
                >
                  Refresh Data
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
