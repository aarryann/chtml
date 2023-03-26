const path = require('path');
const loaders = require('./loaders');
const plugins = require('./plugins');
const webpack = require('webpack'); // to access built-in plugins
module.exports = {
  entry: ["../src/js/app.js"],
  module: {
    rules: [
      loaders.JSLoader
    ]
  },
  output: {
    filename: "js/[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.ProgressPlugin(),
    plugins.ESLintPlugin,
  ],
};