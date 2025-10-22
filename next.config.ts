import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { domains: [] },
  // output: 'standalone', // optional, can remove if causing issues
  trailingSlash: true,
  staticPageGenerationTimeout: 60,
};

export default nextConfig;
