const path = require('path');

module.exports = {
  entry: ['./index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
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
        loader: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
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
