import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'leaflet': 'leaflet/dist/leaflet.js'
    };
    return config;
  },
  transpilePackages: ['leaflet', 'react-leaflet']
};

export default nextConfig;
