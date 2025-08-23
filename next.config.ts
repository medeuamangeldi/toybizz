import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.googleapis.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
