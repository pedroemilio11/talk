import type { NextConfig } from "next";

const backendOrigin = process.env.FLUXI_BACKEND_ORIGIN ?? "https://api-beta-jet-47.vercel.app";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@fluxi/design-system",
    "@fluxi/ui",
    "@fluxi/shared-types",
    "@fluxi/module-sdk",
    "@fluxi/modules-crm",
    "@fluxi/modules-template"
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/:path*`
      },
      {
        source: "/fluxi-talk/:path*",
        destination: `${backendOrigin}/fluxi-talk/:path*`
      }
    ];
  }
};

export default nextConfig;
