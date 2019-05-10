const path = require('path');

const esModules = ['antd', 'rc-*', 'css-animation'].join('|');

module.exports = {
  testURL: 'http://localhost',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFiles: [
    path.join(__dirname, '/lib/enzyme'),
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/webpack.*.js',
    '<rootDir>/src/form-components',
    'dist/',
  ],
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!jest.config.js',
    '!**/coverage/lcov-report/**',
  ],
  transform: {
    '^.+\\.jsx?$': path.join(__dirname, '/lib/babel-jest'),
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};
