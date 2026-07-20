import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Os pacotes do monorepo são consumidos como TS-fonte (sem passo de build próprio),
  // então o Next precisa transpilá-los junto do app.
  transpilePackages: ["@ct/compendio"],
  images: { unoptimized: true },
};

export default nextConfig;
