const config = require('../../jest.config');

module.exports = {
  ...config,
  coverageThreshold: {
    global: {
      branches: 37,
      functions: 40,
      lines: 33,
      statements: 30,
    },
  },
  rootDir: './',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
