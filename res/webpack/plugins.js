const path = require('path');
const _MiniCssExtractPlugin = require('mini-css-extract-plugin');
const _StyleLintPlugin = require('stylelint-webpack-plugin');
const _ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const _HtmlWebpackPlugin = require('html-webpack-plugin');
const entryComponents = require('./entry.config');

const MiniCssExtractPlugin = new _MiniCssExtractPlugin({
  filename: '[name].bundle.css',
  chunkFilename: '[id].css'
});

const ESLintPlugin = new _ESLintPlugin({
  overrideConfigFile: path.resolve(__dirname, './.eslintrc'),
  context: path.resolve(__dirname, '../../src'),
  files: '**/*.js',
});

const StyleLintPlugin = new _StyleLintPlugin({
  configFile: path.resolve(__dirname, './stylelint.config.js'),
  context: path.resolve(__dirname, '../../src/css'),
  files: '**/*.css',
});

const HtmlWebpackPlugin = entryComponents.reduce((entries, item) => {
  if(item.html){
    entries.push(new _HtmlWebpackPlugin({
      inject: true,
      chunks: [item.handle],
      //filename: path.join(__dirname, 'public', item.html),
      //template: path.join(__dirname, 'src', item.html),
      filename: `./${item.html}`,
      template: `./gen/${item.html}`,
    }));
  }
	return entries;
}, []);


module.exports = {
  CleanWebpackPlugin: new CleanWebpackPlugin(),
  MiniCssExtractPlugin: MiniCssExtractPlugin,
  StyleLintPlugin: StyleLintPlugin,
  ESLintPlugin: ESLintPlugin,
  HtmlWebpackPlugin: HtmlWebpackPlugin,
};