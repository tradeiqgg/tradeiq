/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Only add util/path fallbacks if packages are available
    try {
      config.resolve.fallback.util = require.resolve("util/");
    } catch (e) {
      // util is built-in to Node.js, fallback not needed
    }
    
    try {
      config.resolve.fallback.path = require.resolve("path-browserify");
    } catch (e) {
      // path-browserify not installed, skip
      config.resolve.fallback.path = false;
    }
    
    // Fix pino-pretty import issue
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
      };
    }
    
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;

