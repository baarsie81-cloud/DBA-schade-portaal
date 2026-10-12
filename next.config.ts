import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist is client-only; voorkom Node canvas-resolutie in de bundler.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
