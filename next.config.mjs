/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/viewpro/:path*",
        destination: "https://api.viewpro.com/:path*",
      },
    ];
  },
};

export default nextConfig;
