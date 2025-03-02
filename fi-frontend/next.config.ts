/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: "https://wealthme.duckdns.org",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
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
  // Add this section for GitHub Codespaces compatibility
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev',  // Allow GitHub Codespaces URLs
      ],
      bodySizeLimit: '20mb', // Increase the limit to 10 MB or any size you need
    },
  },
};

module.exports = nextConfig;
