const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');
const entry = require('./entries');
const webpack = require('webpack'); // to access built-in plugins
const { merge } = require('webpack-merge');
//const nodeExternals = require('webpack-node-externals');

let generalConfig =  {
  resolve: {
    extensions: ['.ts', '.js', '.css'],
    fallback: {
      net: false, tls: false, fs: false, crypto: false, http: false, https: false, stream: false, zlib: false, os: false, child_process: false, perf_hooks: false,
    }
  },
  stats: { children: true },
  module: {
    rules: [
      //loaders.TSLoader,
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
  ],
};

module.exports = (env, argv) => {
  if(argv.mode === 'development'){
    generalConfig = merge(generalConfig, {
      mode: 'development',
      devtool: 'inline-source-map',
      devServer: {
        contentBase: path.join(__dirname, 'public'),
        static: 'public',
        compress: true,
        port: 9000,
        watchContentBase: true,    
      },
    });
  } else if(argv.mode === 'production'){
    generalConfig = merge(generalConfig, {
      mode: 'production',
    });
  } else{
    throw new Error('Specify Env');
  }
  /*
  const nodeConfig = merge( generalConfig, {
    entry: entry.nodeEntries,
    target: 'node',
    plugins:[
      plugins.TranspilePlugin,
    ],
    externals: [nodeExternals()],
    output: {
      filename: "[name].bundle.js",
      path: path.resolve(__dirname, "../../node"),
      libraryTarget: 'umd',
      libraryExport: 'default',
    },
  });
  */
  const browserConfig = merge( generalConfig, {
    entry: entry.browserEntries,
    target: 'web',
    plugins:[
      ...plugins.HtmlWebpackPlugin,
    ],
    output: {
      //filename: "js/[name].bundle.[contenthash:8].js",
      filename: "js/[name].bundle.js",
      path: path.resolve(__dirname, "../../public"),
      libraryTarget: 'umd',
      //globalObject: 'this',
      //libraryExport: 'default',
      //umdNamedDefine: true,
      library: 'go',
    },
  });

  //return [nodeConfig, browserConfig];
  return browserConfig;
};

