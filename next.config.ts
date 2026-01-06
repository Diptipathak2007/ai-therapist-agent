import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'standalone', // for Vercel serverless
  turbopack: {}, // Enable Turbopack (default in Next.js 16)
  webpack(config) {
    config.resolve!.modules!.push(__dirname + '/src')
    return config
  },
}

export default nextConfig
