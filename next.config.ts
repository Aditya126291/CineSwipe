import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile and local network testing without WebSocket dev blocking
  allowedDevOrigins: ['10.60.61.147', 'localhost:3000'],
};

export default nextConfig;
