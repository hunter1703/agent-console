import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}
export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, await params);
}

async function proxyRequest(request: NextRequest, params: { path: string[] }) {
  try {
    // The local.dev fallback only applies outside production — in production a missing
    // BACKEND_URL should fail loudly rather than silently proxy to an unrelated domain.
    const backendUrl =
      process.env.BACKEND_URL ?? (process.env.NODE_ENV !== 'production' ? 'https://agents.com' : undefined);
    if (!backendUrl) {
      throw new Error('BACKEND_URL environment variable is not set');
    }
    const path = params.path ? params.path.join('/') : '';
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${backendUrl}/${path}${searchParams ? '?' + searchParams : ''}`;

    let fetchClient = globalThis.fetch;
    let fetchOptions: any = {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    };

    // Local dev only: the local ingress presents a self-signed/mkcert certificate that Node's
    // default TLS verification won't trust. Never applies in production — the real backend
    // already has a properly CA-signed certificate, and disabling verification there would be
    // a real MITM/DNS-spoofing exposure for zero benefit.
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { fetch: undiciFetch, Agent } = require('undici');
        fetchClient = undiciFetch;
        fetchOptions.dispatcher = new Agent({ connect: { rejectUnauthorized: false } });
      } catch (e) {
        // Fallback if undici isn't available
        const https = require('https');
        fetchOptions.agent = new https.Agent({ rejectUnauthorized: false });
      }
    }

    const response = await fetchClient(targetUrl, fetchOptions);

    const headers = new Headers(response.headers as HeadersInit);
    headers.delete('content-encoding');
    headers.delete('transfer-encoding');

    return new NextResponse(response.body as any, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error: any) {
    console.error('Proxy Error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
