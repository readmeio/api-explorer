const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  output: {
    filename: './example/bundle.js',
  },
  devServer: {
    contentBase: './example',
    compress: true,
    port: 9966,
    hot: true,
    watchContentBase: true,
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: 'eval-source-map',
});
