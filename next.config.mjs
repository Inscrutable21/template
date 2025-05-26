/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  output: 'standalone',
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/Application Data/**',
        '**/AppData/**',
        '**/Local Settings/**',
        '**/My Documents/**',
        'C:/Users/poona/Application Data/**',
        'C:\\Users\\poona\\Application Data/**'
      ]
    };
    return config;
  }
};

export default nextConfig;
