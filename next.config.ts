import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mongoose", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            // Content-Security-Policy: restricts which scripts/styles/images may load.
            // This is the primary browser-side defence against XSS attacks.
            // Adjust the allowlist as you add new third-party integrations.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + unsafe-inline (required for Next.js hydration) + unsafe-eval + Google
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://apis.google.com",
              // Styles: self + Google Fonts + jsdelivr (KaTeX CSS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              // Fonts: self + Google Fonts CDN + jsdelivr (KaTeX fonts)
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
              // Images: self + data URIs + Unsplash + Google favicons
              "img-src 'self' data: blob: https://images.unsplash.com https://www.google.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              // Connect: self + AI APIs
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.unsplash.com",
              // Frames: self + popular embed providers
              "frame-src 'self' https://www.figma.com https://www.youtube.com https://codepen.io https://codesandbox.io https://docs.google.com https://www.google.com https://www.loom.com https://airtable.com https://typeform.com https://excalidraw.com https://player.vimeo.com",
              // Workers: self + blob for Pyodide
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

};

export default nextConfig;
