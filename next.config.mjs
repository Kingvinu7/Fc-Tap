/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Handle undici/cheerio compatibility issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Exclude problematic modules from client-side bundling
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'undici': 'undici',
        'cheerio': 'cheerio'
      });
    }
    
    return config;
  },
  experimental: {
    esmExternals: 'loose',
    serverComponentsExternalPackages: ['cheerio', 'undici']
  },
  transpilePackages: ['frames.js']
};

export default nextConfig;
