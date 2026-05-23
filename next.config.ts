import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile and local network testing without WebSocket dev blocking
  allowedDevOrigins: ['10.60.61.147', 'localhost:3000'],

  // Applied Secure Transport and Response Headers Hardening Patterns (Pillar 2)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents clickjacking attacks by blocking iframe embedding
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Blocks MIME-type sniffing vulnerabilities
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Protects user privacy while retaining referrers
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload', // Enforces SSL transport strictly
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()', // Restricts access to unused device capabilities
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co https://image.tmdb.org https://*.razorpay.com https://*.tvmaze.com https://static.tvmaze.com https://*.ytimg.com https://img.youtube.com; connect-src 'self' https://*.supabase.co https://api.tvmaze.com https://checkout.razorpay.com https://api.razorpay.com https://lumberjack.razorpay.com https://lumberjack-cx.razorpay.com; frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.youtube.com;", // Restricts resource loading domains securely
          }
        ],
      },
    ];
  },
};

export default nextConfig;
