import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['leaflet', 'react-leaflet'],
  turbopack: {
    resolveAlias: {
      'leaflet': 'leaflet/dist/leaflet.js'
    }
  }
};

export default nextConfig;
