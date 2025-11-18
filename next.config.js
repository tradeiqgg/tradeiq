/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  // This creates a minimal .next/standalone directory with only required files
  output: 'standalone',
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Fix pino-pretty import issue
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pino-pretty': false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;

