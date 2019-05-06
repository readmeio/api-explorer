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
        // loader: "style-loader!css-loader?modules=true"
        // use: {
        //   loader: 'babel-loader',
        //   options: {
        //     extends: '../../.babelrc',
        //   },
        // },
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
