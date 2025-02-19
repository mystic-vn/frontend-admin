/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mystic-upload.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Tắt cache trong môi trường development
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable cache trong development
      config.cache = false;
    }
    return config;
  },
  compiler: {
    // Bỏ comment nếu bạn dùng styled-components
    // styledComponents: true,
  },
  // Tạm thời tắt ESLint và TypeScript checking trong quá trình build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 