/* eslint-disable import/no-extraneous-dependencies */
// TODO switch this back once https://github.com/airbnb/enzyme/issues/1509 is merged
const Adapter = require('enzyme-react-adapter-future');
const enzyme = require('enzyme');

enzyme.configure({ adapter: new Adapter() });
