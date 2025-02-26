/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: "https://wealthme.duckdns.org",
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
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
};

module.exports = nextConfig;
