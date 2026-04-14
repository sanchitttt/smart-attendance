/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'attendance-nitkkr.xyz',
        pathname: '/api/v1/**',
      },
    ],
  },
};

export default nextConfig;