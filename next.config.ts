import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 gebruikt Turbopack by default; lege turbopack-config
  // voorkomt de buildfout bij aanwezigheid van een webpack-hook.
  turbopack: {
    // pdfjs-dist is client-only; stub optionele Node-canvas-resolutie.
    resolveAlias: {
      canvas: {
        browser: "./src/lib/policy-pdf/empty-module.ts",
      },
    },
  },
  // Behoud webpack-alias voor builds met --webpack.
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
