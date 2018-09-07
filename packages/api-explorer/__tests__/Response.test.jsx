const React = require('react');
const { shallow, mount } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');

const Response = require('../src/Response');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);

const props = {
  result: null,
  operation: new Operation({}, '/pet', 'post'),
  hideResults: () => {},
  oas,
  oauth: false,
};

describe('no result', () => {
  test('nothing should render', () => {
    const codeSampleResponseTabs = shallow(<Response {...props} />);

    expect(codeSampleResponseTabs.find('span').length).toBe(0);
  });
});

describe('setTab', () => {
  test('setTab should change state of selectedTab', () => {
    const doc = shallow(<Response {...props} />);

    expect(doc.state('responseTab')).toBe('result');

    doc.instance().setTab('metadata');

    expect(doc.state('responseTab')).toBe('metadata');

    doc.instance().setTab('result');

    expect(doc.state('responseTab')).toBe('result');
  });
});

describe('exampleTab', () => {
  test('exampleTab should change state of exampleTab', () => {
    const doc = shallow(<Response {...props} />);

    expect(doc.state('exampleTab')).toBe(0);

    doc.instance().setExampleTab(1);

    expect(doc.state('exampleTab')).toBe(1);
  });
});

test('should show different component tabs based on state', () => {
  const doc = mount(
    <Response
      {...props}
      result={{
        status: 200,
        responseBody: JSON.stringify({ a: 1 }),
        requestBody: JSON.stringify({ b: 2 }),
        requestHeaders: [],
        method: 'post',
        responseHeaders: [],
      }}
    />,
  );
  expect(doc.find('ResponseBody').length).toBe(1);
  doc.instance().setTab('metadata');

  // I want to do the below assertion instead, but it's not working
  // expect(doc.find('ResponseMetadata').length).toBe(1);
  expect(doc.html().includes('Response Headers')).toBe(true);

  // Should include request body in HTML
  expect(doc.html().includes(JSON.stringify({ b: 2 }))).toBe(true);
});
