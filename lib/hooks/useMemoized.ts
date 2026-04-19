/**
 * Memoization Hooks
 * 
 * Custom hooks for memoizing expensive computations.
 * Based on Open WebUI's performance optimization patterns.
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';
import type { Message, ToolCall } from '@/lib/api/types';
import type { Plan } from '@/types/planning';

/**
 * Memoized message chain computation
 */
export function useMemoizedMessageChain(
  sessionId: string,
  getMessageChain: (sessionId: string) => Message[]
): Message[] {
  return useMemo(
    () => getMessageChain(sessionId),
    [sessionId, getMessageChain]
  );
}

/**
 * Memoized timeline building
 */
export interface TimelineItem {
  type: 'message' | 'tool' | 'plan' | 'confirmation';
  id: string;
  timestamp: number;
  data: any;
}

export function useMemoizedTimeline(
  messages: Message[],
  toolCalls: Record<string, ToolCall>,
  plans: Record<string, Plan>,
  confirmations: Record<string, any>
): TimelineItem[] {
  return useMemo(() => {
    const items: TimelineItem[] = [];

    // Add messages
    messages.forEach((msg) => {
      items.push({
        type: 'message',
        id: msg.id,
        timestamp: new Date(msg.createdTime || Date.now()).getTime(),
        data: msg,
      });
    });

    // Add tool calls
    Object.values(toolCalls).forEach((tc) => {
      items.push({
        type: 'tool',
        id: tc.toolCallId,
        timestamp: new Date(tc.startTime).getTime(),
        data: tc,
      });
    });

    // Add plans
    Object.values(plans).forEach((plan) => {
      items.push({
        type: 'plan',
        id: plan.planId,
        timestamp: plan.createdTime ? new Date(plan.createdTime).getTime() : Date.now(),
        data: plan,
      });
    });

    // Add confirmations
    Object.values(confirmations).forEach((conf) => {
      items.push({
        type: 'confirmation',
        id: conf.confirmationId,
        timestamp: Date.now(),
        data: conf,
      });
    });

    // Sort by timestamp
    return items.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, toolCalls, plans, confirmations]);
}

/**
 * Memoized filtered messages
 */
export function useMemoizedFilteredMessages(
  messages: Message[],
  filter: (msg: Message) => boolean
): Message[] {
  return useMemo(
    () => messages.filter(filter),
    [messages, filter]
  );
}

/**
 * Memoized message search
 */
export function useMemoizedMessageSearch(
  messages: Message[],
  searchTerm: string
): Message[] {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return messages;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(lowerSearchTerm)
    );
  }, [messages, searchTerm]);
}

/**
 * Debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback as T;
}

/**
 * Throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const throttledCallback = useCallback(
    (...args: any[]) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallRef.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback as T;
}

/**
 * Memoized selector from store
 */
export function useMemoizedSelector<T, R>(
  selector: (state: T) => R,
  state: T,
  dependencies: any[] = []
): R {
  return useMemo(
    () => selector(state),
    [selector, state, ...dependencies]
  );
}
