const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const log = require('./example/fixtures/requestmodel.json');

module.exports = merge(common, {
  devServer: {
    contentBase: './example',
    publicPath: '/example/',
    compress: true,
    port: 9966,
    hot: true,
    watchContentBase: true,
    before: app => {
      app.get('/api/logs', (req, res) => {
        // Simulate some loading time
        setTimeout(() => {
          // res.json([]); // no data state
          res.json([...new Array(5).keys()].map(() => ({ ...log, _id: Math.random().toString(5) })));
        }, 500);
      });
    },
  },
  devtool: 'cheap-module-source-map',
  optimization: {
    namedChunks: true,
  },
  output: {
    path: path.resolve(__dirname, 'example'),
    filename: '[name]-bundle.js',
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
