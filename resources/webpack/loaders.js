const TSLoader = {
  test: /\.ts?$/,
  use: 'ts-loader',
  exclude: /node_modules/,
};
module.exports = {
  TSLoader: TSLoader
};