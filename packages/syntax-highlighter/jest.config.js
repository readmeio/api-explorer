const config = require('../../jest.config');

module.exports = {
  ...config,
  rootDir: './',
  coveragePathIgnorePatterns: ['<rootDir>/__tests__/__fixtures__/'],
  testPathIgnorePatterns: ['<rootDir>/__tests__/__fixtures__/'],
};
