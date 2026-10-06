import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/\\(participant\\)/:path*',
        destination: '/:path*',
        permanent: false,
      },
      {
        source: '/\\(organizer\\)/:path*',
        destination: '/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
