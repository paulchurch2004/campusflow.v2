/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  eslint: {
    // Ignorer les erreurs ESLint pendant le build en production
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
