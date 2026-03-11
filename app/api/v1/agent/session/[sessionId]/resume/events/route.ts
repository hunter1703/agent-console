import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await params;
    const bodyText = await req.text();
    const backendUrl = process.env.BACKEND_URL || "http://localhost:18080";
    const backendEndpoint = `${backendUrl}/v1/agent/session/${sessionId}/resume/events`;

    const upstream = await fetch(backendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: bodyText,
      cache: "no-store",
    });

    const headers = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    headers.set("Content-Type", upstreamType || "text/event-stream");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");
    headers.set("X-Accel-Buffering", "no");
    headers.set("X-Agent-Console-Proxy", "resume-sse");
    const requestId = upstream.headers.get("x-request-id");
    if (requestId) headers.set("x-request-id", requestId);

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (error) {
    console.error("Error proxying resume event stream:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
