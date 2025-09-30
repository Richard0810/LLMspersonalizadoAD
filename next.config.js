/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Permite peligrosamente que las compilaciones de producción se completen con éxito
    // aunque tu proyecto tenga errores de tipo.
    // !! ADVERTENCIA !!
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
