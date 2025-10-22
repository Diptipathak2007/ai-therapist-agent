import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: 'standalone', // for Vercel serverless
  experimental: {
    appDir: true, // explicitly enable App Router in src/
  } as any,
  webpack(config) {
    config.resolve!.modules!.push(__dirname + '/src')
    return config
  },
}

export default nextConfig
