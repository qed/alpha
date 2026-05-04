import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard", destination: "/hub/dashboard", permanent: true },
      { source: "/sign-in", destination: "/hub/sign-in", permanent: true },
      { source: "/sign-in/:path*", destination: "/hub/sign-in/:path*", permanent: true },
      { source: "/leaderboard", destination: "/hub/leaderboard", permanent: true },
      { source: "/prospects", destination: "/hub/pipeline", permanent: true },
      { source: "/prospects/:path*", destination: "/hub/pipeline", permanent: true },
      { source: "/hub/prospects", destination: "/hub/pipeline", permanent: true },
      { source: "/champions", destination: "/hub/champions", permanent: true },
      { source: "/geography/:path*", destination: "/hub/geography/:path*", permanent: true },
      { source: "/toronto", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
