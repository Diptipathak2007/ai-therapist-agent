import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { 
    unoptimized: true, // Required for static export
    domains: [] 
  },
  // Remove trailingSlash - it causes issues with error pages
  // trailingSlash: true,
  staticPageGenerationTimeout: 60,
};

export default nextConfig;
