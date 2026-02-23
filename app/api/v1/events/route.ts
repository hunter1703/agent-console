import { NextRequest } from "next/server";
import http from 'http';
import https from 'https';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const bodyText = await req.text();
        const backendUrl = process.env.BACKEND_URL || "http://localhost:18080";
        const backendEndpoint = `${backendUrl}/v1/agent/events`;
        
        const url = new URL(backendEndpoint);
        const client = url.protocol === 'https:' ? https : http;

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();

        const requestOptions = {
            method: 'POST',
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Content-Length': Buffer.byteLength(bodyText)
            }
        };

        const proxyReq = client.request(requestOptions, (proxyRes) => {
            proxyRes.on('data', (chunk) => {
                writer.write(chunk);
            });

            proxyRes.on('end', () => {
                writer.close();
            });

            proxyRes.on('error', (err) => {
                console.error("Proxy response error:", err);
                writer.abort(err);
            });
        });

        proxyReq.on('error', (err) => {
            console.error("Proxy request error:", err);
            writer.abort(err);
        });

        proxyReq.write(bodyText);
        proxyReq.end();

        return new Response(readable, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
                "Transfer-Encoding": "chunked"
            },
        });
    } catch (error) {
        console.error("Error proxying event stream:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}


