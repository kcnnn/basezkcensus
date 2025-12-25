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
        // Ignore optional dependencies that are not needed in browser
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      }
      
      // Add ProvidePlugin to inject Buffer and process globally
      const webpack = require('webpack')
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      )
      
      // Ignore optional dependencies warnings
      config.ignoreWarnings = [
        { module: /node_modules\/@react-native-async-storage/ },
        { module: /node_modules\/pino-pretty/ },
      ]
    }
    return config
  },
}

module.exports = nextConfig

