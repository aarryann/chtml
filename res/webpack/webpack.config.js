const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');
const entry = require('./entries');
const webpack = require('webpack'); // to access built-in plugins
const { merge } = require('webpack-merge');

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
  cache: {
    type: 'filesystem'
  },
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
  const browserConfig = merge( generalConfig, {
    entry: entry.browserEntries,
    target: 'web',
    plugins:[
      ...plugins.HtmlWebpackPlugin,
    ],
    output: {
      filename: "js/[name].bundle.[contenthash:8].js",
      //filename: "js/[name].bundle.js",
      path: path.resolve(__dirname, "../../public"),
      libraryTarget: 'umd',
      library: 'GO',
    },
  });

  return browserConfig;
};

