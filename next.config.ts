import { experimental } from "@grpc/grpc-js";
import { NextConfig } from 'next'

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
  reactStrictMode: true,
      swcMinify: true,
      experimental: {
  }
};





// export default config
module.exports = nextConfig;

