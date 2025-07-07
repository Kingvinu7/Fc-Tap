/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  transpilePackages: ['undici']
};

export default nextConfig;
