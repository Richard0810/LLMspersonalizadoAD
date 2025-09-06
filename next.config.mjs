/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.unicordoba.edu.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
