const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');
const entry = require('./entries');
const general = require('./webpack.general.js');
const webpack = require('webpack'); // to access built-in plugins

const nodeConfig = {
  entry: './src/node.ts',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    filename: "node/[name].bundle.js",
    path: path.resolve(__dirname, "../../public"),
    libraryTarget: 'umd',
    libraryExport: 'default',
  },
};

const browserConfig = {
  entry,
  target: 'web',
  output: {
    filename: "js/[name].bundle.[contenthash:8].js",
    path: path.resolve(__dirname, "../../public"),
    libraryTarget: 'umd',
    globalObject: 'this',
    libraryExport: 'default',
    umdNamedDefine: true,
    library: 'go',
  },
};

module.exports = (env, argv) => {

  const nodeConfig = merge( general, {
    entry: './src/node.ts',
    target: 'node',
    externals: [nodeExternals()],
    output: {
      filename: "node/[name].bundle.js",
      path: path.resolve(__dirname, "../../public"),
      libraryTarget: 'umd',
      libraryExport: 'default',
    },
  };

  Object.assign(nodeConfig, general);
  Object.assign(browserConfig, general);

  return [nodeConfig, broowserConfig];
};

module.exports =  {
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
    ]
  },
  output: {
    filename: "js/[name].bundle.[contenthash:8].js",
    path: path.resolve(__dirname, "../../public"),
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