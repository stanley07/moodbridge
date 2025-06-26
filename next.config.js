/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // ✅ THIS enables static export
    reactStrictMode: true,
    images: {
      unoptimized: true, // ✅ Optional: Needed for image export
    },
  };
  
  module.exports = nextConfig;
  