import type { NextConfig } from "next";

// Baseline security headers applied to every response. Conservative
// values that don't break any of the third-party we already load
// (Adobe Fonts kit, Google Maps embed). Tighten with a CSP later if you
// audit every inline-style/script source.
const SECURITY_HEADERS = [
  // Force HTTPS for 2 years (with subdomain preload eligibility).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Stop MIME-sniffing attacks.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow other origins from iframing the site (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send only the origin (no path/query) on cross-origin navigations.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable powerful browser APIs we never use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  // Hide the on-screen Next.js dev indicator (the badge in the corner).
  devIndicators: false,
  // Allow phones / other LAN devices to reach dev resources (HMR) so hot-reload
  // works when testing on a real device over the local network.
  allowedDevOrigins: ["192.168.1.185", "192.168.1.*"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
