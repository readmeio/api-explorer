const config = require('../../jest.config');

module.exports = {
  ...config,
  rootDir: './',
  moduleNameMapper: {
    "^.+\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/__tests__/helpers'],
  setupTestFrameworkScriptFile: "<rootDir>/__tests__/helpers/test-setup.js",
};
