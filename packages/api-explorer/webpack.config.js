module.exports = {
  entry: './src/index.jsx',
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules\/(?!@readme\/syntax-highlighter)/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  output: {
    filename: './dist/index.js',
    libraryTarget: 'commonjs2',
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },
};
