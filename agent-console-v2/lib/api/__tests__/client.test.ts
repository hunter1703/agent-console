import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { APIClient } from '../client'
import {
  APIError,
  NetworkError,
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ServerError,
} from '../errors'

// Mock fetch
global.fetch = vi.fn()

describe('APIClient', () => {
  let client: APIClient
  let mockFetch: any

  beforeEach(() => {
    client = new APIClient({
      baseURL: 'http://localhost:8080',
      timeout: 5000,
    })
    mockFetch = global.fetch as any
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Initialization', () => {
    it('should create client with default config', () => {
      const defaultClient = new APIClient()
      expect(defaultClient).toBeInstanceOf(APIClient)
    })

    it('should create client with custom config', () => {
      const customClient = new APIClient({
        baseURL: 'https://api.example.com',
        timeout: 10000,
        headers: { 'X-Custom': 'value' },
      })
      expect(customClient).toBeInstanceOf(APIClient)
    })
  })

  describe('Agent API', () => {
    describe('listAgents', () => {
      it('should list agents', async () => {
        const mockAgents = [
          { id: 'agent-1', name: 'Agent 1' },
          { id: 'agent-2', name: 'Agent 2' },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ agents: mockAgents }),
        })

        const agents = await client.listAgents()
        expect(agents).toEqual(mockAgents)
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/catalog/list',
          expect.objectContaining({ method: 'GET' })
        )
      })
    })

    describe('getAgent', () => {
      it('should get agent by id', async () => {
        const mockAgent = { id: 'agent-1', name: 'Agent 1' }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ agent: mockAgent }),
        })

        const agent = await client.getAgent('agent-1')
        expect(agent).toEqual(mockAgent)
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/catalog/agent/agent-1',
          expect.objectContaining({ method: 'GET' })
        )
      })
    })

    describe('createAgent', () => {
      it('should create agent', async () => {
        const agentData = { name: 'New Agent', modelId: 'model-1' }
        const mockAgent = { id: 'agent-1', ...agentData }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ agent: mockAgent }),
        })

        const agent = await client.createAgent(agentData as any)
        expect(agent).toEqual(mockAgent)
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/catalog/agent',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify(agentData),
          })
        )
      })
    })

    describe('updateAgent', () => {
      it('should update agent', async () => {
        const updates = { name: 'Updated Agent' }
        const mockAgent = { id: 'agent-1', ...updates }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ agent: mockAgent }),
        })

        const agent = await client.updateAgent('agent-1', updates)
        expect(agent).toEqual(mockAgent)
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/catalog/agent/agent-1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updates),
          })
        )
      })
    })

    describe('deleteAgent', () => {
      it('should delete agent', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })

        await client.deleteAgent('agent-1')
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/catalog/agent/agent-1',
          expect.objectContaining({ method: 'DELETE' })
        )
      })
    })
  })

  describe('Session API', () => {
    describe('listSessions', () => {
      it('should list sessions', async () => {
        const mockSessions = [
          { id: 'session-1', agentId: 'agent-1' },
          { id: 'session-2', agentId: 'agent-1' },
        ]

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sessions: mockSessions }),
        })

        const sessions = await client.listSessions()
        expect(sessions).toEqual(mockSessions)
      })
    })

    describe('getSession', () => {
      it('should get session by id', async () => {
        const mockSession = { id: 'session-1', agentId: 'agent-1' }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ session: mockSession }),
        })

        const session = await client.getSession('session-1')
        expect(session).toEqual(mockSession)
      })
    })

    describe('createSession', () => {
      it('should create session', async () => {
        const sessionData = { agentId: 'agent-1' }
        const mockSession = { id: 'session-1', ...sessionData }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ session: mockSession }),
        })

        const session = await client.createSession(sessionData as any)
        expect(session).toEqual(mockSession)
      })
    })

    describe('deleteSession', () => {
      it('should delete session', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })

        await client.deleteSession('session-1')
        expect(mockFetch).toHaveBeenCalledWith(
          'http://localhost:8080/v1/agent/session/session-1',
          expect.objectContaining({ method: 'DELETE' })
        )
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw ValidationError on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid request' }),
      })

      await expect(client.listAgents()).rejects.toThrow(ValidationError)
    })

    it('should throw UnauthorizedError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      })

      await expect(client.listAgents()).rejects.toThrow(UnauthorizedError)
    })

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Not found' }),
      })

      await expect(client.getAgent('non-existent')).rejects.toThrow(NotFoundError)
    })

    it('should throw ServerError on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' }),
      })

      await expect(client.listAgents()).rejects.toThrow(ServerError)
    })

    it('should throw ServerError on 502', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({ message: 'Bad gateway' }),
      })

      await expect(client.listAgents()).rejects.toThrow(ServerError)
    })

    it('should throw ServerError on 503', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ message: 'Service unavailable' }),
      })

      await expect(client.listAgents()).rejects.toThrow(ServerError)
    })

    it('should throw APIError on other status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 418,
        json: async () => ({ message: "I'm a teapot" }),
      })

      await expect(client.listAgents()).rejects.toThrow(APIError)
    })

    it('should handle error without json body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('No JSON')
        },
      })

      await expect(client.listAgents()).rejects.toThrow(ServerError)
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))

      await expect(client.listAgents()).rejects.toThrow(NetworkError)
    })
  })

  describe('Request Cancellation', () => {
    it('should cancel specific request', () => {
      // This is a synchronous test of the cancel method
      expect(() => client.cancelRequest('test-key')).not.toThrow()
    })

    it('should cancel all requests', () => {
      expect(() => client.cancelAllRequests()).not.toThrow()
    })
  })

  describe('Custom Headers', () => {
    it('should include default headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: [] }),
      })

      await client.listAgents()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      )
    })

    it('should include custom headers from config', async () => {
      const customClient = new APIClient({
        headers: { 'X-Custom': 'value' },
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: [] }),
      })

      await customClient.listAgents()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      )
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: [] }),
      })

      const agents = await client.listAgents()
      expect(agents).toEqual([])
    })

    it('should handle null response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      })

      const result = await client.listAgents()
      expect(result).toEqual([])
    })

    it('should handle request without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agents: [] }),
      })

      await client.listAgents()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: undefined,
        })
      )
    })

    it('should handle request with body', async () => {
      const data = { name: 'Test' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ agent: data }),
      })

      await client.createAgent(data as any)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(data),
        })
      )
    })
  })
})
