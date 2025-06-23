import { experimental } from "@grpc/grpc-js";
import { NextConfig } from 'next'
import { Configuration } from "webpack";
import "@/utils/polyfill"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
  //   turbo: {
  //     resolveAlias: {
  //       canvas: './empty-module.js',
  //     }
  //   }
  // },
  webpack: (config: Configuration, { isServer }: { isServer: boolean}) => {
    // config.resolve.alias.canvas = false;
    // Needed for PDF rendering libraries
    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          os: false,
          path: false,
          stream: false,
          canvas: false,
        },
      };
    }
    return config;
  },
  reactStrictMode: true,
      swcMinify: true,
      experimental: {
        serverExternalPackages: ['@react-pdf/renderer'],
      }
};





// export default config
module.exports = nextConfig;

