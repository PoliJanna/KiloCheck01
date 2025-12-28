/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ]
  },

  // Environment variable validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    // Vercel automatically handles VERCEL_* variables
    VERCEL_ENV: process.env.VERCEL_ENV,
  },

  // Webpack configuration for security and optimization
  webpack: (config, { dev, isServer }) => {
    // In production, ensure no development secrets leak
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Prevent client-side access to server modules
        '@/lib/security': false,
        '@/lib/secureImageProcessing': false,
      }
    }

    // Bundle optimization
    if (!dev) {
      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    return config
  },

  // Image optimization settings
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Experimental features for security and performance
  experimental: {
    serverComponentsExternalPackages: ['@google/generative-ai'],
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Strict mode for better error catching
  reactStrictMode: true,

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }
      return config
    },
  }),

  // Performance optimizations
  swcMinify: true,
  
  // Output optimization for Vercel
  output: process.env.VERCEL ? undefined : 'standalone',
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig