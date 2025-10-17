/** @type {import('next').NextConfig} */
const nextConfig = {
  srcDir: 'src/',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
