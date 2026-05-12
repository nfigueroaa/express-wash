/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['leaflet', 'react-leaflet'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
module.exports = nextConfig;
