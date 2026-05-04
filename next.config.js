/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  outputFileTracingRoot: __dirname,
  basePath: process.env.GITHUB_ACTIONS ? '/wor3dle' : '',
  trailingSlash: true,
};

module.exports = nextConfig;
