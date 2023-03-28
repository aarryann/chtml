const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');
const entry = require('./entries');
const webpack = require('webpack'); // to access built-in plugins

module.exports = {
  entry,
  resolve: {
    extensions: ['.ts', '.js', '.css'],
    fallback: {
      net: false, tls: false, fs: false, crypto: false, http: false, https: false, stream: false, zlib: false, os: false, child_process: false, perf_hooks: false,
    }
  },
  stats: { children: true },
  module: {
    rules: [
      loaders.TSLoader,
      loaders.CSSLoader,
      loaders.FileLoader,
      {
        test: /\.html?$/,
        use: ['html-loader', 'full-partial-view-loader'],
        include: /src/,
      },
    ]
  },
  resolveLoader: {
    alias: {
      'full-partial-view-loader': path.resolve(__dirname, 'full-partial-view-loader.js'),
    },
  },
  output: {
    filename: "js/[name].bundle.[contenthash:8].js",
    path: path.resolve(__dirname, "../../dist"),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    plugins.CleanWebpackPlugin,
    plugins.ESLintPlugin,
    plugins.StyleLintPlugin,
    new webpack.ids.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
    plugins.MiniCssExtractPlugin,
    ...plugins.HtmlWebpackPlugin,
  ],
};