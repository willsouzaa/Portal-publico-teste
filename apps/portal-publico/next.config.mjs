/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  eslint: {
    // Ignore ESLint errors during production builds to avoid failing deploys.
    // You can remove this after addressing all linting issues.
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/apartamentos-venda-:citySlug-:stateSlug/:slugId',
        destination: '/empreendimentos/:slugId'
      }
    ];
  }
};

export default nextConfig;
