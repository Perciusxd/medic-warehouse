import { experimental } from "@grpc/grpc-js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   turbo: {
  //     resolveAlias: {
  //       canvas: './empty-module.js',
  //     }
  //   }
  // },
  webpack: (config, { isServer }) => {
    // config.resolve.alias.canvas = false;
    // Needed for PDF rendering libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        os: false,
        path: false,
        stream: false,
        canvas: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
