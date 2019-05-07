module.exports = {
  entry: ['whatwg-fetch', './src/index.jsx'],
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules\/(?!(@mia-platform\/syntax-highlighter|fetch-har))/,
        use: {
          loader: 'babel-loader',
          options: {
            extends: '../../.babelrc',
          },
        },
      },
      {
        test: /\.css$/,
        use:['style-loader','css-loader'],
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
