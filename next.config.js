/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow external scripts and modules
  experimental: {
    optimizePackageImports: ['qrcode'],
  },
  // Turbopack config (Next.js 16 default)
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Provide polyfills for Node.js modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
        crypto: false,
        stream: false,
        util: false,
        process: require.resolve('process/browser'),
      }
      
      // Add ProvidePlugin to inject Buffer and process globally
      const webpack = require('webpack')
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      )
    }
    return config
  },
}

module.exports = nextConfig

