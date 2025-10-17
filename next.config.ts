/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [],
  },
  output: 'standalone',
  trailingSlash: true,
  // Remove experimental.appDir - it's now stable in Next.js 15
  staticPageGenerationTimeout: 60, // Increase timeout
}

module.exports = nextConfig