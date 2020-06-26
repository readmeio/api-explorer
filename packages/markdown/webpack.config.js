const path = require('path');
const merge = require('webpack-merge');
const ExtractCSS = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const output = {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name].js',
  libraryTarget: 'commonjs2',
};

const browserConfig = {
  entry: ['./index.js'],
  output,
  plugins: [
    new ExtractCSS({
      filename: '[name].css',
    }),
  ],
  optimization: {
    minimize: false,
    minimizer: [new TerserPlugin()],
    // concatenateModules: false,
    // namedModules: true,
    // namedChunks: true,
    // removeAvailableModules: false,
    // flagIncludedChunks: false,
    // occurrenceOrder: false,
  },
  module: {
    rules: [
      {
        test: /node_modules\/.*(is-plain-obj|parse5)\/.*.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            extends: '../../.babelrc',
          },
        },
      },
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            extends: '../../.babelrc',
          },
        },
      },
      {
        test: /\.css$/,
        loader: [ExtractCSS.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        loaders: [ExtractCSS.loader, 'css-loader', 'sass-loader'],
      },
      {
        // eslint-disable-next-line unicorn/no-unsafe-regex
        test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader?name=dist/fonts/[hash].[ext]',
        exclude: /(node_modules|bower_components)/,
      },
      {
        test: /\.(txt|md)$/i,
        use: 'raw-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },
  devServer: {
    port: 6699,
    contentBase: './dist',
    watchContentBase: true,
    compress: true,
    // hot: true,
  },
};

const serverConfig = merge(browserConfig, {
  target: 'node',
  output: {
    filename: '[name].node.js',
  },
});

module.exports = [browserConfig, serverConfig];
