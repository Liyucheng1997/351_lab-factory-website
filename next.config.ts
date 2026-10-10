import type { NextConfig } from "next";

// 纯静态导出，部署到 GitHub Pages（项目站点在 /仓库名/ 子路径下，由 CI 传入 NEXT_PUBLIC_BASE_PATH）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
