/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  // This creates a minimal .next/standalone directory with only required files
  // Significantly reduces image size and improves startup time
  output: 'standalone',
  // Optimize build performance for Docker
  experimental: {
    // Exclude unnecessary files from build traces to speed up standalone builds
    // This significantly reduces build time in Docker environments
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-*',
        'node_modules/webpack',
        'node_modules/.cache',
        'node_modules/**/*.md',
        'node_modules/**/*.ts',
        'node_modules/**/*.map',
        '.git',
        '.next/cache',
        '**/*.test.*',
        '**/*.spec.*',
      ],
    },
  },
  // Optimize build performance
  swcMinify: true,
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

