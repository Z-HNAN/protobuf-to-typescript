/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 定义全局常量
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.PROJECT_ROOT': JSON.stringify(process.cwd()),
      })
    );

    return config;
  },
}

module.exports = nextConfig
