/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: '/v2',
  images: {
    unoptimized: true,
    contentDispositionType: 'inline',
  },
};
export default nextConfig;
