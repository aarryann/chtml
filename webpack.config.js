const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const ESLintPlugin = require('eslint-webpack-plugin');

const listOfComponents = [
  {"handle": "main",  "js": "/lib/index.js"              , "html": "/index.html"},
  {"handle": "feeds", "js": "/lib/feeds/feeds-alpine.js" , "html": "/feeds/index.html"},
  {"handle": "about", "js": "/lib/about/index.js"        , "html": "/about/index.html"},
]

const entry = listOfComponents.reduce((entries, item) => {
	entries[item.handle] = item.js;
	return entries;
}, {});

const htmlGenerators = listOfComponents.reduce((entries, item) => {
	entries.push(new HtmlWebpackPlugin({
		inject: true,
		chunks: [item.handle],
    //filename: path.join(__dirname, 'public', item.html),
    //template: path.join(__dirname, 'src', item.html),
    filename: `./${item.html}`,
    template: `./src/pages/${item.html}`,
	}));
	return entries;
}, []);


module.exports = {
  mode: "production",
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      net: false, tls: false, fs: false, crypto: false, http: false, https: false, stream: false, zlib: false, os: false, child_process: false, perf_hooks: false,
    }
  },
  stats: { children: true },
  entry,
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',   
  },
  plugins: [
    //new ESLintPlugin(),
		new CleanWebpackPlugin(), // use the clean plugin to delete the dist folder before a build
    new webpack.ids.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
    ...htmlGenerators
    //new HtmlWebpackPlugin({
    //  inject: true,
    //  template: `./src/pages/index.html`,
    //}),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },   
  }, 
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
};