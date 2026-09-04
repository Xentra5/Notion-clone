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
              // Scripts: self + Stripe + Razorpay + Google (Pyodide CDN for code runner)
              "script-src 'self' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com https://cdn.jsdelivr.net https://apis.google.com",
              // Styles: self + Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Fonts: self + Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + data URIs + Unsplash + Google favicons
              "img-src 'self' data: blob: https://images.unsplash.com https://www.google.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
              // Connect: self + AI APIs + payment APIs
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.stripe.com https://api.razorpay.com https://api.unsplash.com",
              // Frames: Stripe uses iframes for payment elements
              "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.razorpay.com",
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
