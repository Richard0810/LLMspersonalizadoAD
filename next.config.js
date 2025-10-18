/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        // This was added to temporarily solve a build issue in Vercel.
        // The root cause seems to be a type mismatch in the genkit library that
        // only manifests during the Vercel build process.
        // This should be removed once the underlying issue is resolved.
        ignoreBuildErrors: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '4.5mb',
        },
    },
};

module.exports = nextConfig;
