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
  // Add these to fix the build error
  output: 'standalone',
  trailingSlash: true,
  experimental: {
    appDir: true,
  },
  // Disable static generation for error pages
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig