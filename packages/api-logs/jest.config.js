const config = require('../../jest.config');

module.exports = {
  ...config,
  rootDir: './',
  coveragePathIgnorePatterns: [
    'lib/'
  ],
};
