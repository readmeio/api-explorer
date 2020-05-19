module.exports = {
  entry: {
    demo: [
      // We require the babel polyfill because the swagger2openapi module uses generators
      'babel-polyfill',
      'react-hot-loader/patch',
      'whatwg-fetch',
      './example/index.jsx',
    ],
    reference: [
      'babel-polyfill',
      'react-hot-loader/patch',
      'whatwg-fetch',
      './example/reference/index.jsx',
    ],
  },
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules\/(?!(@mia-platform\/(syntax-highlighter|json-editor)|swagger2openapi|fetch-har))/,
        use: {
          loader: 'babel-loader',
          options: {
            extends: './.babelrc',
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
