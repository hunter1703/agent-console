/**
 * Virtualized Message List
 * 
 * Renders only visible messages for performance with 1000+ messages.
 * Based on react-window for efficient rendering.
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import type { Message } from '@/lib/api/types';
import { MessageItem } from './MessageItem';

interface VirtualizedMessageListProps {
  messages: Message[];
  height: number;
  width: string | number;
  itemSize?: number;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

/**
 * Virtualized message list component
 * Only renders visible items for performance
 */
export function VirtualizedMessageList({
  messages,
  height,
  width,
  itemSize = 120,
  onLoadMore,
  isLoadingMore = false,
}: VirtualizedMessageListProps) {
  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Handle scroll to load more
  const handleScroll = useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      // If scrolled to top and can load more, trigger load
      if (scrollOffset === 0 && onLoadMore && !isLoadingMore) {
        onLoadMore();
      }
    },
    [onLoadMore, isLoadingMore]
  );

  // Render individual row
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const message = memoizedMessages[index];

      if (!message) {
        return null;
      }

      return (
        <div style={style} key={message.id}>
          <MessageItem message={message} />
        </div>
      );
    },
    [memoizedMessages]
  );

  return (
    <List
      height={height}
      itemCount={memoizedMessages.length}
      itemSize={itemSize}
      width={width}
      onScroll={handleScroll}
      overscanCount={5} // Render 5 items outside visible area for smoother scrolling
    >
      {Row}
    </List>
  );
}

/**
 * Hook to determine if virtual scrolling should be enabled
 */
export function useVirtualScrolling(messageCount: number, threshold: number = 100): boolean {
  return messageCount > threshold;
}

/**
 * Hook to estimate item size based on message content
 */
export function useEstimatedItemSize(messages: Message[]): number {
  if (messages.length === 0) return 120;

  // Calculate average height based on content length
  const avgContentLength =
    messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / messages.length;

  // Estimate: base height + content height
  // Assume ~50 pixels per 100 characters
  const contentHeight = Math.ceil((avgContentLength / 100) * 50);
  const baseHeight = 80; // Header, padding, etc.

  return Math.max(100, Math.min(500, baseHeight + contentHeight));
}
