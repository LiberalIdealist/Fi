/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuration for Next.js app features
  experimental: {
    // Keep app directory enabled
    appDir: true,
  },
  // Images configuration
  images: {
    domains: ['localhost'],
    // Add any external domains you might use for images
    // domains: ['images.example.com', 'placeholders.com'], 
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
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
}

module.exports = nextConfig