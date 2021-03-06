const path = require('path');

module.exports = {
  collectCoverageFrom: ['**/*.{js,jsx}', '!**/node_modules/**', '!jest.config.js', '!**/coverage/lcov-report/**'],
  coveragePathIgnorePatterns: ['<rootDir>/webpack.*.js', '<rootDir>/src/form-components', 'dist/'],

  // per https://github.com/facebook/jest/issues/9396#issuecomment-573328488
  coverageReporters: ['json', 'text', 'lcov', 'clover'],

  coverageThreshold: {
    global: {
      branches: 88,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
    '\\.svg$': path.join(__dirname, '/lib/svgr-mock.js'),
  },
  setupFiles: [path.join(__dirname, '/lib/enzyme')],
  testMatch: [
    // Matches:
    //  - __tests__/*/test.test.js
    //  - __tests__/*/test_test.js
    '**/__tests__/**/(*[._])+test.[jt]s?(x)',
  ],
  testURL: 'http://localhost',
  transform: {
    '^.+\\.jsx?$': path.join(__dirname, '/lib/babel-jest'),
  },
};
