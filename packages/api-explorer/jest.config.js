const config = require('../../jest.config');

module.exports = {
  ...config,
  rootDir: './',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: ['/node_modules/(?!@readme/syntax-highlighter).+\\.js$'],
};
