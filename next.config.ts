import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the on-screen Next.js dev indicator (the badge in the corner).
  devIndicators: false,
  // Allow phones / other LAN devices to reach dev resources (HMR) so hot-reload
  // works when testing on a real device over the local network.
  allowedDevOrigins: ["192.168.1.185", "192.168.1.*"],
};

export default nextConfig;
