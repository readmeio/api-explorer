const path = require('path');

module.exports = {
  testURL: 'http://localhost',
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  setupFiles: [path.join(__dirname, '/lib/enzyme')],
  coveragePathIgnorePatterns: ['<rootDir>/webpack.*.js', '<rootDir>/src/form-components', 'dist/'],
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!jest.config.js', '!**/coverage/lcov-report/**'],
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.jsx?$': path.join(__dirname, '/lib/babel-jest'),
  },
};
