import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === 'edge') {
      config.externals = [
        ...(config.externals || []),
        'net',
        'tls',
        'stream',
        'crypto',
        'perf_hooks',
        'events',
        'buffer',
        'util',
        'fs',
        'path',
      ];
    }
    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
