/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images configuration
  images: {
    domains: [
      'localhost',
      'firebasestorage.googleapis.com',
    ],
  },
  // Add experimental config for Server Actions
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'ubiquitous-waddle-7v5j49wq95wjhwrrp-3000.app.github.dev'
      ],
      allowedForwardedOrigins: [
        'ubiquitous-waddle-7v5j49wq95wjhwrrp-3000.app.github.dev'
      ],
      bodySizeLimit: '10mb' // Increase the body size limit to 10 MB
    },
  },
  // Add redirects for auth routes to maintain compatibility
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/signup',
        permanent: true,
      },
      {
        source: '/auth/signup',
        destination: '/signup',
        permanent: true,
      },
    ];
  },
  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://fi-19942791895.asia-southeast1.run.app',
  },
  // Additional compiler options
  compiler: {
    // Removes React properties that aren't used at runtime
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable static optimization where possible
  typescript: {
    // Don't fail the build on TypeScript errors during development
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },
  // Add rewrites for API routes to point to the backend
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'https://fi-19942791895.asia-southeast1.run.app/:path*', // Point to your backend
      },
      // Add this new rewrite for the gemini analysis endpoint
      {
        source: '/models/chat/geminiAnalysis',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/gemini/analysis`,
      },
    ];
  },
}

module.exports = nextConfig