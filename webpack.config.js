const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common');
const log = require('./example/fixtures/requestmodel.json');

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
    before: (app) => {
      app.get('/api/logs', (req, res) => {
        res.json([...Array(5).keys()].map(() =>
          Object.assign({}, log, { _id: Math.random().toString(5) }),
        ));
      });
    },
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  devtool: 'cheap-module-source-map',
});
