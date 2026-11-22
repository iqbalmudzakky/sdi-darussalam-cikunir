import type { NextConfig } from "next";
import { getLiteracySiteUrl } from "./modules/shared/literacyUrl";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/literasi/:path*",
        destination: getLiteracySiteUrl(),
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
