const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const log = require('./example/fixtures/requestmodel.json');

const userAgents = ['node-fetch/x.x.x', 'Ruby', 'python-requests/x.x.x', 'php/x.x.x'];

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
          const seedData = [...new Array(5).keys()].map(() => ({
            ...JSON.parse(JSON.stringify(log)),
            _id: Math.random().toString(5),
          }));
          const seedDataWithModifiedRequestHeaders = userAgents.reduce((acc, userAgent, i) => {
            if (acc[i]) {
              acc[i].requestHeaders[0].value = userAgent;
            }
            return acc;
          }, seedData);
          res.json(seedDataWithModifiedRequestHeaders);
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
