const React = require('react');
const { shallow } = require('enzyme');
// const extensions = require('../../readme-oas-extensions');
const petstore = require('./fixtures/petstore/oas');

const Response = require('../src/Response');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);

const noResult = {
  result: null,
  operation: new Operation({}, '/pet', 'post'),
};

describe('no result', () => {
  test('nothing should render', () => {
    const codeSampleResponseTabs = shallow(<Response {...noResult} oas={oas} />);

    expect(codeSampleResponseTabs.find('span').length).toBe(0);
  });
});
