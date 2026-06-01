/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'gateway.pinata.cloud' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    // Externalize pino-pretty for server-side builds
    if (isServer) {
      config.externals.push('pino-pretty');
    }
    
    return config;
  },
};

export default nextConfig;
