const path = require('path');
const _MiniCssExtractPlugin = require('mini-css-extract-plugin');
const _StyleLintPlugin = require('stylelint-webpack-plugin');
const _ESLintPlugin = require('eslint-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const _HtmlWebpackPlugin = require('html-webpack-plugin');
const _GoGenHTMLWebpackPlugin = require('../scripts/GoGenHTMLWebpackPlugin');
const _CopyWebpackPlugin = require('copy-webpack-plugin');

const entryComponents = require('./entry.config');
//const _TranspilePlugin = require('transpile-webpack-plugin');

const isProd = process.argv.indexOf('--mode=production') >= 0;

const MiniCssExtractPlugin = new _MiniCssExtractPlugin({
  filename: 'assets/css/[name].bundle.css',
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

const CopyWebpackPlugin = new _CopyWebpackPlugin({
  patterns: [
    { from: "src/assets", to: "assets" },
  ],
});

const GoGenHTMLWebpackPlugin = new _GoGenHTMLWebpackPlugin();

const HtmlWebpackPlugin = entryComponents.browserEntry.reduce((entries, item) => {
  if(item.html){
    item.dependencies = item.dependencies || [];
    entries.push(new _HtmlWebpackPlugin({
      inject: false,
      chunks: [item.handle, ...item.dependencies],
      //filename: path.join(__dirname, 'public', item.html),
      //template: path.join(__dirname, 'src', item.html),
      filename: `./${item.html}`,
      template: `./gen/${item.html}`,
      minify: {
        collapseWhitespace: isProd,
        removeComments: false
      }
    }));
  }
	return entries;
}, []);

//const TranspilePlugin = new _TranspilePlugin();

module.exports = {
  CleanWebpackPlugin: new CleanWebpackPlugin(),
  MiniCssExtractPlugin: MiniCssExtractPlugin,
  StyleLintPlugin: StyleLintPlugin,
  ESLintPlugin: ESLintPlugin,
  HtmlWebpackPlugin: HtmlWebpackPlugin,
  GoGenHTMLWebpackPlugin: GoGenHTMLWebpackPlugin,
  //TranspilePlugin: TranspilePlugin,
  CopyWebpackPlugin: CopyWebpackPlugin,
};