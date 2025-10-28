import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add environment variables that should be public
  env: {
    NEXT_PUBLIC_HOST_NAME: process.env.NEXT_PUBLIC_HOST_NAME,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

export default nextConfig;
