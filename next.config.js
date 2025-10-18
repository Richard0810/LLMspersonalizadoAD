
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
  typescript: {
    // ADVERTENCIA: Esta configuración permite que la compilación de producción
    // se complete exitosamente incluso si el proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
