import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// Bundle analyzer configuration
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

// Backend host is env-driven (NEXT_PUBLIC_API_BASE_URL), so the CSP allowing fetches to it
// has to be too — otherwise pointing the app at any non-localhost backend (e.g. a local
// ingress host) silently gets blocked by this policy instead of by anything the backend does.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const connectSrc = ["'self'", "http://localhost:*", "ws://localhost:*"];
if (apiBaseUrl) {
  connectSrc.push(apiBaseUrl);
}

const nextConfig: NextConfig = {
  /* config options here */

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              `connect-src ${connectSrc.join(' ')}`, // Allow local API/WebSocket, plus the configured backend
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
};

export default withBundleAnalyzer(nextConfig);
