module.exports = {
  entry: [
    'whatwg-fetch',
    './src/index.jsx',
  ],
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules\/(?!(@readme\/syntax-highlighter|fetch-har))/,
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
