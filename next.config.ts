
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: {
    // Mantém a posição do indicador de desenvolvimento
    position: 'bottom-right',
  },

  experimental: {
    agentFeedback: true,
  },

  cacheComponents: true,

  partialPrefetching: true,

  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
