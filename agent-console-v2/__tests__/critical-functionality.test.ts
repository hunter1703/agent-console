/**
 * Critical Functionality Tests
 * 
 * This test suite validates that all critical components, hooks, stores, and API
 * functions are working correctly. It focuses on integration and corner cases.
 */

import { describe, it, expect } from 'vitest'

// Phase 1: Utilities
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime, formatDuration } from '@/lib/utils/formatDate'
import { truncate, truncateMiddle } from '@/lib/utils/truncate'
import { debounce, throttle } from '@/lib/utils/debounce'
import {
  hexToRgb,
  rgbToHex,
  lighten,
  darken,
  mixColors,
  generateGradient,
  isLight,
  getContrastingTextColor,
} from '@/lib/utils/colors'

describe('Phase 1: Critical Utility Functions', () => {
  describe('cn - classname utility', () => {
    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    })
  })

  describe('formatRelativeTime', () => {
    it('should format recent times', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('just now')
    })

    it('should format past times', () => {
      const past = new Date(Date.now() - 60 * 1000)
      expect(formatRelativeTime(past)).toBe('1m ago')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(45)).toBe('45s')
    })

    it('should format complex durations', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s')
    })
  })

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...')
    })

    it('should handle custom suffix', () => {
      // "Hello World" is 11 chars, maxLength 8, suffix '…' is 1 char
      // Available for text: 8 - 1 = 7 chars
      // Result: "Hello W" + "…" = "Hello W…" (8 chars total)
      expect(truncate('Hello World', 8, '…')).toBe('Hello W…')
    })
  })

  describe('truncateMiddle', () => {
    it('should truncate middle for file names', () => {
      expect(truncateMiddle('very-long-file-name.txt', 15)).toBe('very-l...me.txt')
    })
  })

  describe('debounce', () => {
    it('should create debounced function', () => {
      const fn = debounce(() => {}, 100)
      expect(typeof fn).toBe('function')
    })
  })

  describe('throttle', () => {
    it('should create throttled function', () => {
      const fn = throttle(() => {}, 100)
      expect(typeof fn).toBe('function')
    })
  })

  describe('color utilities', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should convert RGB to hex', () => {
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
    })

    it('should lighten colors', () => {
      const result = lighten('#808080', 20)
      const rgb = hexToRgb(result)
      expect(rgb!.r).toBeGreaterThan(128)
    })

    it('should darken colors', () => {
      const result = darken('#808080', 20)
      const rgb = hexToRgb(result)
      expect(rgb!.r).toBeLessThan(128)
    })

    it('should mix colors', () => {
      expect(mixColors('#FF0000', '#0000FF', 0)).toBe('#ff0000')
      expect(mixColors('#FF0000', '#0000FF', 1)).toBe('#0000ff')
    })

    it('should generate gradients', () => {
      const gradient = generateGradient('#FF0000', '#0000FF', 135)
      expect(gradient).toContain('linear-gradient')
      expect(gradient).toContain('#FF0000')
      expect(gradient).toContain('#0000FF')
    })

    it('should detect light colors', () => {
      expect(isLight('#FFFFFF')).toBe(true)
      expect(isLight('#000000')).toBe(false)
    })

    it('should get contrasting text color', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('#000000')
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF')
    })
  })
})

describe('Phase 1: Animation Constants', () => {
  it('should export spring presets', async () => {
    const { springPresets } = await import('@/lib/constants/animations')
    expect(springPresets.default).toBeDefined()
    expect(springPresets.snappy).toBeDefined()
    expect(springPresets.bouncy).toBeDefined()
  })

  it('should export easing curves', async () => {
    const { easings } = await import('@/lib/constants/animations')
    expect(easings.easeOut).toBeDefined()
    expect(easings.easeIn).toBeDefined()
    expect(easings.easeInOut).toBeDefined()
  })

  it('should export motion variants', async () => {
    const { fadeIn, slideUp, scaleIn } = await import('@/lib/constants/animations')
    expect(fadeIn).toBeDefined()
    expect(slideUp).toBeDefined()
    expect(scaleIn).toBeDefined()
  })
})

describe('Phase 1: Theme Constants', () => {
  it('should export light theme', async () => {
    const { lightTheme } = await import('@/lib/constants/theme')
    expect(lightTheme.background).toBe('#FFFFFF')
    expect(lightTheme.surface).toBe('#FEFCE8')
    expect(lightTheme.primary).toBe('#F59E0B')
  })

  it('should export dark theme', async () => {
    const { darkTheme } = await import('@/lib/constants/theme')
    expect(darkTheme.background).toBe('#09090B')
    expect(darkTheme.surface).toBe('#18181B')
    expect(darkTheme.primary).toBe('#FAFAFA')
  })

  it('should export typography', async () => {
    const { typography } = await import('@/lib/constants/theme')
    expect(typography.fontSize.base).toBe('15px')
    expect(typography.fontWeight.regular).toBe(400)
  })

  it('should export spacing', async () => {
    const { spacing } = await import('@/lib/constants/theme')
    expect(spacing[4]).toBe('16px')
    expect(spacing[6]).toBe('24px')
  })
})

describe('Phase 4: Store Initialization', () => {
  it('should initialize UI store', async () => {
    const { useUIStore } = await import('@/lib/stores/uiStore')
    const state = useUIStore.getState()
    expect(state.sidebarView).toBeDefined()
    expect(state.setSidebarView).toBeDefined()
  })

  it('should initialize agent store', async () => {
    const { useAgentStore } = await import('@/lib/stores/agentStore')
    const state = useAgentStore.getState()
    expect(state.agents).toBeDefined()
    expect(state.fetchAgents).toBeDefined()
  })

  it('should initialize session store', async () => {
    const { useSessionStore } = await import('@/lib/stores/sessionStore')
    const state = useSessionStore.getState()
    expect(state.sessions).toBeDefined()
    expect(state.fetchSessions).toBeDefined()
  })

  it('should initialize chat store', async () => {
    const { useChatStore } = await import('@/lib/stores/chatStore')
    const state = useChatStore.getState()
    expect(state.messagesBySession).toBeDefined()
    expect(state.addMessage).toBeDefined()
  })

  it('should initialize planning store', async () => {
    const { usePlanningStore } = await import('@/lib/stores/planningStore')
    const state = usePlanningStore.getState()
    expect(state.planningBySession).toBeDefined()
    expect(state.updatePlanningState).toBeDefined()
  })
})

describe('Phase 5: API Client', () => {
  it('should export API client', async () => {
    const { apiClient } = await import('@/lib/api/client')
    expect(apiClient).toBeDefined()
    expect(apiClient.listAgents).toBeDefined()
    expect(apiClient.listSessions).toBeDefined()
    expect(apiClient.sendMessage).toBeDefined()
  })

  it('should export error classes', async () => {
    const {
      APIError,
      NetworkError,
      ValidationError,
      UnauthorizedError,
      NotFoundError,
      ServerError,
    } = await import('@/lib/api/errors')
    
    expect(APIError).toBeDefined()
    expect(NetworkError).toBeDefined()
    expect(ValidationError).toBeDefined()
    expect(UnauthorizedError).toBeDefined()
    expect(NotFoundError).toBeDefined()
    expect(ServerError).toBeDefined()
  })
})

describe('Integration: Store Actions', () => {
  it('should handle UI store actions', async () => {
    const { useUIStore } = await import('@/lib/stores/uiStore')
    
    // Test sidebar toggle
    const initialCollapsed = useUIStore.getState().sidebarCollapsed
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarCollapsed).toBe(!initialCollapsed)
    
    // Test sidebar view change
    useUIStore.getState().setSidebarView('agents')
    expect(useUIStore.getState().sidebarView).toBe('agents')
    
    // Test modal
    useUIStore.getState().openModal('createAgent', { name: 'Test' })
    expect(useUIStore.getState().activeModal).toBe('createAgent')
    expect(useUIStore.getState().modalData).toEqual({ name: 'Test' })
    
    useUIStore.getState().closeModal()
    expect(useUIStore.getState().activeModal).toBeNull()
  })

  it('should handle chat store actions', async () => {
    const { useChatStore } = await import('@/lib/stores/chatStore')
    const store = useChatStore.getState()
    
    const sessionId = 'test-session'
    const message = {
      id: 'msg-1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: new Date(),
    }
    
    // Add message
    store.addMessage(sessionId, message)
    const messages = store.getMessages(sessionId)
    expect(messages).toHaveLength(1)
    expect(messages[0].content).toBe('Hello')
    
    // Update message
    store.updateMessage(sessionId, 'msg-1', { content: 'Updated' })
    const updated = store.getMessageById(sessionId, 'msg-1')
    expect(updated?.content).toBe('Updated')
    
    // Clear messages
    store.clearMessages(sessionId)
    expect(store.getMessages(sessionId)).toHaveLength(0)
  })

  it('should handle session store hierarchy', async () => {
    const { useSessionStore } = await import('@/lib/stores/sessionStore')
    const store = useSessionStore.getState()
    
    const sessions = [
      { id: '1', name: 'Parent', agentId: 'agent-1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', name: 'Child 1', agentId: 'agent-1', parentSessionId: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', name: 'Child 2', agentId: 'agent-1', parentSessionId: '1', createdAt: new Date(), updatedAt: new Date() },
    ]
    
    store.setSessionsAction(sessions)
    
    const tree = store.getSessionTree()
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe('1')
    expect(tree[0].children).toHaveLength(2)
  })
})

describe('Corner Cases and Edge Cases', () => {
  describe('Utility edge cases', () => {
    it('should handle empty strings', () => {
      expect(truncate('', 10)).toBe('')
      expect(truncateMiddle('', 10)).toBe('')
    })

    it('should handle invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(lighten('invalid', 20)).toBe('invalid')
    })

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0s')
    })
  })

  describe('Store edge cases', () => {
    it('should handle non-existent session messages', async () => {
      const { useChatStore } = await import('@/lib/stores/chatStore')
      const store = useChatStore.getState()
      
      const messages = store.getMessages('non-existent')
      expect(messages).toEqual([])
    })

    it('should handle empty session tree', async () => {
      const { useSessionStore } = await import('@/lib/stores/sessionStore')
      const store = useSessionStore.getState()
      
      store.setSessionsAction([])
      const tree = store.getSessionTree()
      expect(tree).toEqual([])
    })
  })
})
