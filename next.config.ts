import type { NextConfig } from "next";

const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  // Enable static export for Capacitor
  output: isCapacitorBuild ? 'export' : undefined,

  // Disable image optimization for static export
  images: {
    unoptimized: isCapacitorBuild
  },

  // Trailing slash for better static file serving
  trailingSlash: isCapacitorBuild,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: isCapacitorBuild
      ? 'https://fin-app-hazel.vercel.app'
      : '',
  }
};

export default nextConfig;
