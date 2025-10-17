/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
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
