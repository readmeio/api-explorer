/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true }] */
const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const common = require('./webpack.common');

module.exports = merge(common, {
  output: {
    filename: './example/dist/[name]-bundle.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new UglifyJsPlugin(),
  ],
});
