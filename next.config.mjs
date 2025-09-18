/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Increase the body size limit for server actions to 4.5MB
    // This is to allow for larger payloads, like images, to be sent to server actions.
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
   serverActions: {
      bodySizeLimit: '4.5mb',
    },
};

export default nextConfig;
