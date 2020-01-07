/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true }] */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  output: {
    path: path.resolve(__dirname, 'example/dist'),
    filename: '[name]-bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
  ],
});
