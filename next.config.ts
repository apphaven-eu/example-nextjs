import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces .next/standalone with a self-contained server.js.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
