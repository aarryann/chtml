const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
//const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin")


const listOfComponents = [
  {"handle": "main",  "js": "/lib/index.js"              , "html": "/index.html"},
  {"handle": "feeds", "js": "/lib/feeds/feeds-alpine.js" , "html": "/feeds/index.html"},
  {"handle": "about", "js": "/lib/about/index.js"        , "html": "/about/index.html"},
  {"handle": "tailwind", "css": "/src/main.css"},
]

const entry = listOfComponents.reduce((entries, item) => {
  if(item.js)
	  entries[item.handle] = item.js;
  else if (item.css)
    entries[item.handle] = item.css;
	return entries;
}, {});

const htmlGenerators = listOfComponents.reduce((entries, item) => {
  if(item.html){
    entries.push(new HtmlWebpackPlugin({
      inject: true,
      chunks: [item.handle],
      //filename: path.join(__dirname, 'public', item.html),
      //template: path.join(__dirname, 'src', item.html),
      filename: `./${item.html}`,
      template: `./src/pages/${item.html}`,
    }));
  }
	return entries;
}, []);


module.exports = {
  mode: "production",
  resolve: {
    extensions: ['.ts', '.js', '.css'],
    fallback: {
      net: false, tls: false, fs: false, crypto: false, http: false, https: false, stream: false, zlib: false, os: false, child_process: false, perf_hooks: false,
    }
  },
  stats: { children: true },
  entry,
  plugins: [
    //new ESLintPlugin(),
		new CleanWebpackPlugin(), // use the clean plugin to delete the dist folder before a build
    new webpack.ids.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    ...htmlGenerators,
  ],
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'src'),
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },      
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',   
  },
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
    static: 'dist',
    compress: true,
    port: 9000,
    watchContentBase: true,
  },
};