const config = require('../../jest.config');

module.exports = {
  ...config,
  coveragePathIgnorePatterns: ['./replaceVars.js'],
  rootDir: './',
};
