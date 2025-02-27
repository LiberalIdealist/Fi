import { NextConfig } from 'next';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove the swcMinify option as it's enabled by default now
  // swcMinify: true,
  env: {
    BACKEND_URL: "https://wealthme.duckdns.org",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'your-storage-account.blob.core.windows.net'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ]
  },
  // Add experimental features if needed
  experimental: {
    serverActions: {},
  },
};

export default nextConfig;
