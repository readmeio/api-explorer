const config = require('../../jest.config');

module.exports = {
  ...config,
  rootDir: './',
  transformIgnorePatterns: ['/node_modules/(?!@readme/syntax-highlighter).+\\.js$'],
};
