import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [],
  },
  trailingSlash: true,
  staticPageGenerationTimeout: 60,
  // Remove standalone output to prevent missing module errors
  output: undefined,
}

export default nextConfig
