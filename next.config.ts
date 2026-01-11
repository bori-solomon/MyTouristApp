import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["2e8d29565f30b72f-199-203-64-245.serveousercontent.com", "localhost:3000"]
    }
  }
};

export default nextConfig;
