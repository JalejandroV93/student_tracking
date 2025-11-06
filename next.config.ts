import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Habilitar modo standalone para optimización de producción con Docker
  output: 'standalone',

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
