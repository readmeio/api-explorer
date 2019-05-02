const config = require('../../jest.config');

module.exports = {
  ...config,
  rootDir: './',
  // transformIgnorePatterns: ['<rootDir>/node_modules/'],
  // transform: {
  //   "^.+\\.(js|jsx)?$": "babel-jest",
  // },
  // moduleFileExtensions: [
  //   "js",'css', 'json', 'jsx',
  // ],
  // moduleDirectories: [
  //   "node_modules"
  // ],
  moduleNameMapper: {
    "^.+\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
  },
};
