/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'user-images.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.shields.io',
      },
      {
        protocol: 'https',
        hostname: '*.juejin.byteimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.cnblogs.com',
      },
      {
        protocol: 'https',
        hostname: 'camo.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cloud.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'p1-juejin.byteimg.com',
      },
      {
        protocol: 'https',
        hostname: 'p9-juejin.byteimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img2023.cnblogs.com',
      },
      {
        protocol: 'http',
        hostname: 'images2015.cnblogs.com',
      },
      {
        protocol: 'https',
        hostname: 'images2015.cnblogs.com',
      },
    ],
  },
}

module.exports = nextConfig 