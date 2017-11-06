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
  hideResults: () => {},
};

describe('no result', () => {
  test('nothing should render', () => {
    const codeSampleResponseTabs = shallow(<Response {...noResult} oas={oas} />);

    expect(codeSampleResponseTabs.find('span').length).toBe(0);
  });
});

describe('setTab', () => {
  test('setTab should change state of selectedTab', () => {
    const doc = shallow(<Response {...noResult} oas={oas} />);

    expect(doc.state('responseTab')).toBe('result');

    doc.instance().setTab('metadata');

    expect(doc.state('responseTab')).toBe('metadata');

    doc.instance().setTab('result');

    expect(doc.state('responseTab')).toBe('result');
  });
});

describe('exampleTab', () => {
  test('exampleTab should change state of exampleTab', () => {
    const doc = shallow(<Response {...noResult} oas={oas} />);

    expect(doc.state('exampleTab')).toBe(0);

    doc.instance().setExampleTab(1);

    expect(doc.state('exampleTab')).toBe(1);
  });
});
