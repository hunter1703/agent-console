/**
 * Utility for reading SSE streams using Fetch and ReadableStream.
 * Handles POST requests and provides a generator for raw event data.
 */

export interface SSEEvent {
    event?: string;
    data: string;
    id?: string;
}

export async function* fetchSseStream(
    url: string,
    options: RequestInit
): AsyncGenerator<SSEEvent, void, unknown> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            "Accept": "text/event-stream",
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`SSE request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    if (!response.body) {
        throw new Error("Response body is null");
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";

    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += value;
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                yield parseSseLine(line);
            }
        }

        // Process remaining buffer if it looks like a complete event
        if (buffer.trim()) {
            yield parseSseLine(buffer);
        }
    } finally {
        reader.releaseLock();
    }
}

function parseSseLine(line: string): SSEEvent {
    const event: SSEEvent = { data: "" };
    const parts = line.split("\n");

    for (const part of parts) {
        const colonIndex = part.indexOf(":");
        if (colonIndex === -1) continue;

        const field = part.slice(0, colonIndex).trim();
        const value = part.slice(colonIndex + 1).trim();

        if (field === "data") {
            event.data = event.data ? `${event.data}\n${value}` : value;
        } else if (field === "event") {
            event.event = value;
        } else if (field === "id") {
            event.id = value;
        }
    }

    return event;
}
