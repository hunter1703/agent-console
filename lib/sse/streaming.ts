/**
 * SSE Streaming Utilities
 * 
 * Based on Open WebUI's battle-tested streaming implementation.
 * Adapted for AG-UI protocol.
 */

import { EventSourceParserStream } from 'eventsource-parser/stream';
import type { ParsedEvent } from 'eventsource-parser';

export type AGUIStreamUpdate = {
  done: boolean;
  event: any;
  error?: any;
};

/**
 * Creates an async generator from an SSE stream.
 * Uses EventSourceParserStream for proper SSE parsing.
 */
export async function createAGUIStream(
  responseBody: ReadableStream<Uint8Array>
): Promise<AsyncGenerator<AGUIStreamUpdate>> {
  const eventStream = responseBody
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();
  
  return aguiStreamToIterator(eventStream);
}

async function* aguiStreamToIterator(
  reader: ReadableStreamDefaultReader<ParsedEvent>
): AsyncGenerator<AGUIStreamUpdate> {
  while (true) {
    const { value, done } = await reader.read();
    
    if (done) {
      yield { done: true, event: null };
      break;
    }
    
    if (!value) {
      continue;
    }
    
    const data = value.data;
    
    if (data.startsWith('[DONE]')) {
      yield { done: true, event: null };
      break;
    }
    
    try {
      const parsedEvent = JSON.parse(data);
      
      if (parsedEvent.error) {
        yield { done: true, event: null, error: parsedEvent.error };
        break;
      }
      
      yield { done: false, event: parsedEvent };
    } catch (e) {
      console.error('Error parsing AG-UI event:', e, 'Raw data:', data);
      // Continue processing other events
    }
  }
}

/**
 * Chunks large text deltas into smaller pieces for smoother streaming animation.
 * Based on Open WebUI's streamLargeDeltasAsRandomChunks.
 */
export async function* chunkLargeDeltas(
  content: string,
  minChunkSize: number = 1,
  maxChunkSize: number = 3,
  delayMs: number = 5
): AsyncGenerator<string> {
  if (content.length < 5) {
    yield content;
    return;
  }
  
  let remaining = content;
  while (remaining.length > 0) {
    const chunkSize = Math.min(
      Math.floor(Math.random() * (maxChunkSize - minChunkSize + 1)) + minChunkSize,
      remaining.length
    );
    
    const chunk = remaining.slice(0, chunkSize);
    yield chunk;
    
    // Skip delay if tab is hidden (timers are throttled to 1s in hidden tabs)
    if (typeof document !== 'undefined' && document.visibilityState !== 'hidden') {
      await sleep(delayMs);
    }
    
    remaining = remaining.slice(chunkSize);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
