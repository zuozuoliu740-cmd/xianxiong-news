/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: '/v2',
  images: {
    unoptimized: true,
    contentDispositionType: 'inline',
  },
  async headers() {
    return [
      {
        // 小程序CORS: 允许所有 /api/ai-lab 接口跨域访问
        source: '/api/ai-lab/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        // 允许 /uploads 静态资源跨域访问
        source: '/uploads/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
export default nextConfig;
