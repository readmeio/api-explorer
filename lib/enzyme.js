/* eslint-disable import/no-extraneous-dependencies */
const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');

require('babel-polyfill');

enzyme.configure({ adapter: new Adapter() });
