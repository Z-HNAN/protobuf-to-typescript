const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            { 
              from: require('./bin/protoc'),
              to: path.resolve(__dirname, '.next/server/bin/protoc'),
              toType: 'file',
            }
          ]
        }),
        new PermissionsOutputPlugin({
          buildFiles: [
            {
              path: path.resolve(__dirname, '.next/server/bin/protoc'),
              fileMode: '755'
            }
          ]
        })
      );
    }
    return config;
  }
}

module.exports = nextConfig
