/** @type {import('next').NextConfig} */
const nextConfig = {
  srcDir: 'src',
  typescript: {
    // ADVERTENCIA: Esta configuración permite que la compilación de producción
    // se complete exitosamente incluso si el proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
