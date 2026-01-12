import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "bs-tourist-app.vercel.app",
        "localhost:3000"
      ]
    }
  }
};

export default nextConfig;
