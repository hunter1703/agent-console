/**
 * Sessions API
 * 
 * All session-related API calls.
 */

import { get, post, put, del } from '../client';
import type { Session, PaginatedResult, Query, Message, ToolCall } from '../types';
import { shouldSaveToBackend } from '@/lib/store/temporaryChat';

/**
 * List all sessions
 */
export async function listSessions(query?: Query): Promise<PaginatedResult<Session>> {
  const params = new URLSearchParams();
  
  if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
  if (query?.pageNumber) params.append('pageNumber', query.pageNumber.toString());
  
  const queryString = params.toString();
  const endpoint = `/v1/sessions${queryString ? `?${queryString}` : ''}`;
  
  return get<PaginatedResult<Session>>(endpoint);
}

/**
 * Get session by ID
 */
export async function getSession(
  sessionId: string,
  includeEvents: boolean = false
): Promise<Session> {
  const params = new URLSearchParams();
  if (includeEvents) params.append('includeEvents', 'true');
  
  const queryString = params.toString();
  const endpoint = `/v1/sessions/${sessionId}${queryString ? `?${queryString}` : ''}`;
  
  return get<Session>(endpoint);
}

/**
 * Create new session
 */
export async function createSession(session: Partial<Session>): Promise<Session> {
  return post<Session>('/v1/sessions', session);
}

/**
 * Update session
 */
export async function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Promise<Session> {
  // Check if should save to backend (respects temporary mode)
  if (!shouldSaveToBackend(sessionId)) {
    console.log('Skipping session update - temporary mode enabled');
    // Return a mock session object to prevent errors
    return { id: sessionId, ...updates } as Session;
  }
  
  return put<Session>(`/v1/sessions/${sessionId}`, updates);
}

/**
 * Delete session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  // Check if should save to backend (respects temporary mode)
  if (!useShouldSaveToBackend(sessionId)) {
    console.log('Skipping session deletion - temporary mode enabled');
    return;
  }
  
  return del<void>(`/v1/session/${sessionId}`);
}

/**
 * Get session messages
 */
export async function getSessionMessages(
  sessionId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<Message[]> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('pageSize', pageSize.toString());
  
  const endpoint = `/v1/sessions/${sessionId}/messages?${params.toString()}`;
  const result = await get<PaginatedResult<Message>>(endpoint);
  
  return result.items;
}

/**
 * Get session tool calls
 */
export async function getSessionToolCalls(sessionId: string): Promise<ToolCall[]> {
  const endpoint = `/v1/sessions/${sessionId}/tool-calls`;
  return get<ToolCall[]>(endpoint);
}

/**
 * Invoke agent (start or continue session)
 */
export interface InvokeRequest {
  sessionId?: string;
  parts: Array<{
    type: 'text' | 'image';
    text?: string;
    base64?: string;
    mimeType?: string;
  }>;
}

export interface InvokeResponse {
  sessionId: string;
  messageId: string;
}

export async function invokeAgent(
  agentId: string,
  request: InvokeRequest
): Promise<InvokeResponse> {
  return post<InvokeResponse>(`/v1/agents/${agentId}/invoke`, request);
}

/**
 * Submit confirmation — AG-UI Resume payload.
 */
export interface ConfirmationRequest {
  confirmed: boolean;
  answer?: string;
}

export async function submitConfirmation(
  sessionId: string,
  confirmationId: string,
  request: ConfirmationRequest
): Promise<void> {
  // Check if should save to backend (respects temporary mode)
  if (!useShouldSaveToBackend(sessionId)) {
    console.log('Skipping confirmation submission - temporary mode enabled');
    return;
  }

  return post<void>(
    `/v1/session/${sessionId}/confirm`,
    {
      interruptId: confirmationId,
      status: 'resolved',
      payload: {
        confirmed: request.confirmed,
        answer: request.answer,
      },
    }
  );
}
