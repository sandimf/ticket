/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const origin = process.env.GO_BACKEND_ORIGIN || 'http://localhost:5000';
    return [
      {
        source: '/uploads/:path*',
        destination: `${origin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;