import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:18080";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // These are proxy rules that happen BEFORE Next.js checks its own API routes
      ],
      afterFiles: [
        // These happen AFTER Next.js checks its own API routes.
        // This ensures our custom /app/api/v1/events/route.ts handles the stream
        // without getting intercepted and buffered by the proxy.
        {
          source: "/api/health",
          destination: `${backendUrl}/q/health`,
        },
        {
          source: "/api/v1/schemas",
          destination: `${backendUrl}/schemas`,
        },
        {
          source: "/api/v1/schemas/:path*",
          destination: `${backendUrl}/schemas/:path*`,
        },
        {
          source: "/api/v1/:path*",
          destination: `${backendUrl}/v1/:path*`,
        }
      ],
      fallback: []
    }
  },
};

export default nextConfig;
