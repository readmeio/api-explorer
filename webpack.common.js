module.exports = {
  entry: [
    // We require the babel polyfill because the swagger2openapi module uses generators
    'babel-polyfill',
    'react-hot-loader/patch',
    'whatwg-fetch',
    './example/index.jsx',
  ],
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules\/(?!(@readme\/syntax-highlighter|swagger2openapi|fetch-har))/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx'],
  },
  node: {
    fs: 'empty',
  },
};
