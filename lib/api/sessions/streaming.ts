/**
 * Session Streaming
 * 
 * SSE streaming for session events.
 */

/**
 * Open SSE stream for session
 */
export function openSessionStream(
  sessionId: string,
  onMessage: (event: MessageEvent) => void,
  onError?: (error: Event) => void
): EventSource {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  const url = `${baseUrl}/v1/sessions/${sessionId}/stream`;
  
  const eventSource = new EventSource(url);
  
  eventSource.onmessage = onMessage;
  
  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    console.error('SSE readyState:', eventSource.readyState);
    console.error('SSE url:', url);
    
    if (onError) {
      onError(error);
    }
  };
  
  return eventSource;
}

/**
 * Close SSE stream
 */
export function closeSessionStream(eventSource: EventSource): void {
  eventSource.close();
}
