import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@fluxi/design-system",
    "@fluxi/ui",
    "@fluxi/shared-types",
    "@fluxi/module-sdk",
    "@fluxi/modules-crm",
    "@fluxi/modules-template"
  ]
};

export default nextConfig;

