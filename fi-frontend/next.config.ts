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
};

module.exports = nextConfig;
