/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  transpilePackages: ["nepali-date"],
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;