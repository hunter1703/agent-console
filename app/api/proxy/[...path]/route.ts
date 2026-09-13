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
    const backendUrl = process.env.BACKEND_URL || 'https://agents.com';
    const path = params.path ? params.path.join('/') : '';
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${backendUrl}/${path}${searchParams ? '?' + searchParams : ''}`;

    // Dynamically require undici to bypass TLS verification safely without polluting globals
    let fetchClient = globalThis.fetch;
    let fetchOptions: any = {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    };

    if (typeof process !== 'undefined') {
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
