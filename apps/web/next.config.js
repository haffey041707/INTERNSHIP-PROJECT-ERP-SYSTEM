/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/vercel-seed.db.template'],
    },
  },
  transpilePackages: ['@edunexus/design-tokens'],
};
module.exports = nextConfig;
