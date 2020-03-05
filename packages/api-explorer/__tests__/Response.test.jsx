const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('@readme/oas-tooling');

const petstore = require('./__fixtures__/petstore/oas');

const Response = require('../src/Response');

const { Operation } = Oas;
const oas = new Oas(petstore);

const props = {
  hideResults: () => {},
  result: null,
  oas,
  oauth: false,
  onChange: () => {},
  operation: new Operation({}, '/pet', 'post'),
};

describe('no result', () => {
  it('nothing should render', () => {
    const codeSampleResponseTabs = shallow(<Response {...props} />);

    expect(codeSampleResponseTabs.find('span')).toHaveLength(0);
  });
});

describe('setTab', () => {
  it('setTab should change state of selectedTab', () => {
    const doc = shallow(<Response {...props} />);

    expect(doc.state('responseTab')).toBe('result');

    doc.instance().setTab('metadata');

    expect(doc.state('responseTab')).toBe('metadata');

    doc.instance().setTab('result');

    expect(doc.state('responseTab')).toBe('result');
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
    />
  );
  expect(doc.find('ResponseBody')).toHaveLength(1);
  doc.instance().setTab('metadata');

  // I want to do the below assertion instead, but it's not working
  // expect(doc.find('ResponseMetadata').length).toBe(1);
  expect(doc.html()).toContain('Response Headers');

  // Should include request body in HTML
  expect(doc.html()).toContain(JSON.stringify({ b: 2 }));
});
