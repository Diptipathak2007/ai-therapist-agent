import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  },
  images: { 
    unoptimized: true,
  },
  // experimental options can go here if needed, but appDir is auto-enabled
}

export default nextConfig
