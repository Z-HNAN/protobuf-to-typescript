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
              from: path.resolve(process.cwd(), './bin', require('./bin/protoc')),
              to: path.resolve(process.cwd(), '.next/server/chunks/bin/protoc'),
              toType: 'file',
            },
            { 
              from: path.resolve(process.cwd(), './bin', require('./bin/ts-proto')),
              to: path.resolve(process.cwd(), '.next/server/chunks/bin/ts-proto'),
              toType: 'file',
            }
          ]
        }),
        new PermissionsOutputPlugin({
          buildFiles: [
            {
              path: path.resolve(__dirname, '.next/server/chunks/bin/protoc'),
              fileMode: '755'
            },
            {
              path: path.resolve(__dirname, '.next/server/chunks/bin/ts-proto'),
              fileMode: '755'
            }
          ]
        }),
      );
    }
    return config;
  }
}

module.exports = nextConfig
