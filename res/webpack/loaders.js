const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TSLoader = {
  test: /\.ts?$/,
  use: [{
    loader: 'ts-loader',
    options: {
      configFile: "tsconfig.app.json"
    }
  }],
  exclude: /node_modules/,
};

const CSSLoader = {
  test: /\.css$/i,
  exclude: /node_modules/,
  use: [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: path.resolve(__dirname, '../../public/assets/css/')
      }
    },
    {
      loader: 'css-loader',
      options: {importLoaders: 1},
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          config: path.resolve(__dirname, './postcss.config.js'),
        },
      },
    },
  ],
};

const FileLoader = {
  test: /\.(png|jpe?g|gif)$/i,
  use: [
    {
      loader: 'file-loader',
      options: {
        outputPath: 'images',
        publicPath: path.resolve(__dirname, 'public/')
      },
    },
  ],
};

module.exports = {
  CSSLoader: CSSLoader,
  TSLoader: TSLoader,
  FileLoader: FileLoader,
};