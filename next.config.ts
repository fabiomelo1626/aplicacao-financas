import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // Desativa o badge/botão flutuante no canto da tela (Dev Overlay / Toast)
    appIsrStatus: false,
    buildActivity: false,
    // Em versões recentes do Next.js / Turbopack:
    position: "bottom-right", // ou remova se preferir desativar via CSS abaixo
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;