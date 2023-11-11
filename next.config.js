const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            { from: require('./bin/protoc'), to: 'bin/proto', toType: 'file' }
          ]
        })
      );
    }
    return config;
  }
}

module.exports = nextConfig
