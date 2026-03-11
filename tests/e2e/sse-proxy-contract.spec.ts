import { expect, test } from "@playwright/test";
import { POST } from "@/app/api/v1/events/route";

test("AC-INF-003 events proxy preserves streaming cadence and anti-buffering headers", async () => {
  let forwardedUrl = "";
  const encoder = new TextEncoder();
  const upstreamBody = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"type":"RUN_STARTED"}\n\n'));
      setTimeout(() => {
        controller.enqueue(encoder.encode('data: {"type":"RUN_FINISHED"}\n\n'));
        controller.close();
      }, 140);
    },
  });

  const originalFetch = global.fetch;
  global.fetch = (async (input, init) => {
    forwardedUrl =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const headers = new Headers(init?.headers as HeadersInit);
    expect(init?.method).toBe("POST");
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("text/event-stream");
    return new Response(upstreamBody, {
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "x-request-id": "req-abc-123",
      },
    });
  }) as typeof fetch;

  try {
    const response = await POST(
      new Request("http://127.0.0.1:3000/api/v1/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId: "echo_agent", input: "ping" }),
      }) as any,
    );

    expect(forwardedUrl.endsWith("/v1/agent/events")).toBeTruthy();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("cache-control")).toBe("no-cache, no-transform");
    expect(response.headers.get("connection")).toBe("keep-alive");
    expect(response.headers.get("x-accel-buffering")).toBe("no");
    expect(response.headers.get("x-agent-console-proxy")).toBe("events-sse");
    expect(response.headers.get("x-request-id")).toBe("req-abc-123");

    const reader = response.body?.getReader();
    expect(reader).toBeTruthy();
    const decoder = new TextDecoder();

    const firstStart = Date.now();
    const firstChunk = await reader!.read();
    const firstElapsedMs = Date.now() - firstStart;
    expect(firstChunk.done).toBe(false);
    expect(decoder.decode(firstChunk.value)).toContain("RUN_STARTED");
    expect(firstElapsedMs).toBeLessThan(100);

    const secondStart = Date.now();
    const secondChunk = await reader!.read();
    const secondElapsedMs = Date.now() - secondStart;
    expect(secondChunk.done).toBe(false);
    expect(decoder.decode(secondChunk.value)).toContain("RUN_FINISHED");
    expect(secondElapsedMs).toBeGreaterThanOrEqual(80);

    const endChunk = await reader!.read();
    expect(endChunk.done).toBe(true);
  } finally {
    global.fetch = originalFetch;
  }
});
