const { withSentryConfig } = require("@sentry/nextjs");

const isProduction = process.env.NODE_ENV === "production";

function getOriginFromEnv(value) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`).origin;
  } catch {
    return null;
  }
}

const apiOrigin = getOriginFromEnv(process.env.NEXT_PUBLIC_API_URL);
const siteOrigin = getOriginFromEnv(
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined
);

const connectSrc = [
  "'self'",
  "https://res.cloudinary.com",
  "https://script.google.com",
  "https://api.emailjs.com",
  "https://*.ingest.sentry.io",
];
if (apiOrigin) connectSrc.push(apiOrigin);
if (siteOrigin && siteOrigin !== apiOrigin) connectSrc.push(siteOrigin);

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com`,
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
   "frame-src https://maps.google.com https://www.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const secureHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  {
    key: "Content-Security-Policy",
    value: CONTENT_SECURITY_POLICY,
  },
];

const noIndexHeaders = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: isProduction ? 3600 : 60,
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  experimental: {
    typedRoutes: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: secureHeaders,
      },
      {
        source: "/admin",
        headers: noIndexHeaders,
      },
      {
        source: "/admin/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/dashboard/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/parent",
        headers: noIndexHeaders,
      },
      {
        source: "/parent/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/admin-login",
        headers: noIndexHeaders,
      },
      {
        source: "/school-login",
        headers: noIndexHeaders,
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
});
