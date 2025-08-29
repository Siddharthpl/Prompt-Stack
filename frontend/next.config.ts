/** @type {import('next').NextConfig} */
const nextConfig = {
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
