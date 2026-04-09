import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // pdfkit loads bundled font metric files (js/data/*.afm). If Next bundles it,
  // those files may not be present at runtime. Keep it external on the server.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
