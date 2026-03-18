/**
 * Enhanced Streaming API Module
 * Handles SSE stream operations with automatic reconnection and improved error handling
 */

import { API_CONFIG } from '../config';

const API_BASE = API_CONFIG.BASE_URL;

// ============================================================================
// Types
// ============================================================================

export interface SSEEvent {
    event?: string;
    data: string;
    id?: string;
}

export interface StreamOptions {
    signal?: AbortSignal;
    headers?: Record<string, string>;
    retryDelay?: number;
    maxRetries?: number;
    onRetry?: (attempt: number, error: Error) => void;
    onReconnect?: (attempt: number) => void;
}

export interface StreamCallbacks<T> {
    onEvent?: (event: T) => void;
    onError?: (error: Error) => void;
    onComplete?: () => void;
    onReconnecting?: (attempt: number) => void;
}

export interface StreamState {
    isConnected: boolean;
    isConnecting: boolean;
    error: Error | null;
    retryCount: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds
const DEFAULT_MAX_RETRIES = 5;

// Exponential backoff with jitter
function calculateRetryDelay(attempt: number, baseDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
    return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
}

// ============================================================================
// Core Stream Functions
// ============================================================================

/**
 * Fetch and consume an SSE stream with improved error handling
 */
export async function* fetchSseStream(
    url: string,
    options: RequestInit & StreamOptions = {}
): AsyncGenerator<SSEEvent, void, unknown> {
    const {
        signal,
        headers,
        retryDelay = DEFAULT_RETRY_DELAY,
        maxRetries = DEFAULT_MAX_RETRIES,
        onRetry,
        onReconnect,
    } = options;

    let retryCount = 0;

    while (true) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    Accept: 'text/event-stream',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorBody = await response.text().catch(() => 'Unknown error');
                throw new Error(
                    `SSE request failed: ${response.status} ${response.statusText} - ${errorBody}`
                );
            }

            if (!response.body) {
                throw new Error('Response body is null');
            }

            // Reset retry count on successful connection
            retryCount = 0;

            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = '';

            try {
                while (true) {
                    // Check if aborted
                    if (signal?.aborted) {
                        reader.releaseLock();
                        return;
                    }

                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += value;
                    const lines = buffer.split(/\r?\n\r?\n/);
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        const parsed = parseSseLine(line);
                        if (!parsed.data.trim()) continue;
                        yield parsed;
                    }
                }

                // Process remaining buffer
                if (buffer.trim()) {
                    const parsed = parseSseLine(buffer);
                    if (parsed.data.trim()) {
                        yield parsed;
                    }
                }
            } finally {
                reader.releaseLock();
            }

            // Stream completed successfully
            return;
        } catch (error) {
            // Don't retry on abort
            if (signal?.aborted) {
                throw error;
            }

            // Check if we should retry
            if (retryCount >= maxRetries) {
                console.error(`Max retries (${maxRetries}) exceeded for SSE stream`);
                throw error;
            }

            // Calculate delay and retry
            const delay = calculateRetryDelay(retryCount, retryDelay);
            console.warn(
                `SSE stream error, retrying in ${Math.round(delay)}ms (attempt ${retryCount + 1}/${maxRetries})`,
                error
            );

            onRetry?.(retryCount + 1, error as Error);

            await sleep(delay);
            retryCount++;
            onReconnect?.(retryCount);
        }
    }
}

/**
 * Consume an SSE stream with callbacks (alternative to generator)
 */
export async function consumeSseStream<T>(
    url: string,
    options: RequestInit & StreamOptions = {},
    callbacks: StreamCallbacks<T> = {}
): Promise<void> {
    const { onEvent, onError, onComplete, onReconnecting } = callbacks;

    try {
        for await (const event of fetchSseStream(url, options)) {
            if (onEvent) {
                try {
                    const data = JSON.parse(event.data);
                    onEvent(data as T);
                } catch {
                    onEvent(event.data as unknown as T);
                }
            }
        }
        onComplete?.();
    } catch (error) {
        if (onError) {
            onError(error as Error);
        } else {
            throw error;
        }
    }
}

/**
 * Stream agent chat with automatic reconnection
 */
export async function* streamAgentChat(
    agentId: string,
    message: string,
    sessionId?: string | null,
    options?: StreamOptions
): AsyncGenerator<any, void, unknown> {
    const url = `${API_BASE}/v1/agent/${agentId}/chat`;

    const body: any = {
        message,
        sessionId: sessionId || undefined,
    };

    yield* fetchSseStream(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: options?.signal,
        retryDelay: options?.retryDelay,
        maxRetries: options?.maxRetries,
        onRetry: options?.onRetry,
        onReconnect: options?.onReconnect,
    });
}

/**
 * Create a resilient stream connection with state tracking
 */
export function createResilientStream<T>(
    streamFn: () => AsyncGenerator<T, void, unknown>,
    callbacks: StreamCallbacks<T> = {}
): {
    start: () => Promise<void>;
    stop: () => void;
    getState: () => StreamState;
} {
    let state: StreamState = {
        isConnected: false,
        isConnecting: false,
        error: null,
        retryCount: 0,
    };

    let abortController: AbortController | null = null;
    let isRunning = false;

    const updateState = (updates: Partial<StreamState>) => {
        state = { ...state, ...updates };
    };

    const start = async () => {
        if (isRunning) return;
        isRunning = true;

        abortController = new AbortController();

        updateState({ isConnecting: true, error: null });

        try {
            for await (const event of streamFn()) {
                if (!isRunning) break;

                updateState({ isConnected: true, isConnecting: false });
                callbacks.onEvent?.(event);
            }

            updateState({ isConnected: false, isConnecting: false });
            callbacks.onComplete?.();
        } catch (error) {
            updateState({
                isConnected: false,
                isConnecting: false,
                error: error as Error,
            });
            callbacks.onError?.(error as Error);
        }
    };

    const stop = () => {
        isRunning = false;
        abortController?.abort();
        abortController = null;
        updateState({ isConnected: false, isConnecting: false });
    };

    const getState = () => ({ ...state });

    return { start, stop, getState };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a single SSE line into an event object
 */
function parseSseLine(line: string): SSEEvent {
    const event: SSEEvent = { data: '' };
    const parts = line.split(/\r?\n/);

    for (const part of parts) {
        if (!part || part.startsWith(':')) continue;

        const colonIndex = part.indexOf(':');
        if (colonIndex === -1) continue;

        const field = part.slice(0, colonIndex).trim();
        const value = part.slice(colonIndex + 1).trim();

        if (field === 'data') {
            event.data = event.data ? `${event.data}\n${value}` : value;
        } else if (field === 'event') {
            event.event = value;
        } else if (field === 'id') {
            event.id = value;
        }
    }

    return event;
}

/**
 * Create an AbortController for stream cancellation
 */
export function createStreamController(): AbortController {
    return new AbortController();
}

/**
 * Cancel an ongoing stream
 */
export function cancelStream(controller: AbortController | null): void {
    if (controller) {
        controller.abort();
    }
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
    // Network errors are usually retryable
    if (error.message.includes('network') || error.message.includes('fetch')) {
        return true;
    }

    // HTTP 5xx errors are retryable
    if (error.message.includes('500') || error.message.includes('502') ||
        error.message.includes('503') || error.message.includes('504')) {
        return true;
    }

    // Connection errors are retryable
    if (error.message.includes('connection') || error.message.includes('timeout')) {
        return true;
    }

    return false;
}

/**
 * Get a human-readable stream status message
 */
export function getStreamStatusMessage(state: StreamState): string {
    if (state.isConnecting) {
        return `Connecting... (attempt ${state.retryCount + 1})`;
    }
    if (state.isConnected) {
        return 'Connected';
    }
    if (state.error) {
        if (state.retryCount > 0) {
            return `Connection lost. Retrying...`;
        }
        return `Error: ${state.error.message}`;
    }
    return 'Disconnected';
}
