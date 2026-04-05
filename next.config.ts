import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    localPatterns: [
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
