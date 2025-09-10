import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    unoptimized: true, // Disable image optimization for static export
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
