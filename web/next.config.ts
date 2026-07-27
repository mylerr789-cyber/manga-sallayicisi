import type { NextConfig } from "next";

const pbUrl = new URL(process.env.NEXT_PUBLIC_PB_URL || "http://127.0.0.1:8090");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: pbUrl.protocol.replace(":", "") as "http" | "https",
        hostname: pbUrl.hostname,
        port: pbUrl.port,
        pathname: "/api/files/**",
      },
    ],
  },
};

export default nextConfig;
