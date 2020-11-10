const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('oas/tooling');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');

const Response = require('../src/Response');

const oas = new Oas(petstore);

const props = {
  hideResults: () => {},
  result: null,
  oas,
  oauth: false,
  onChange: () => {},
  operation: oas.operation('/pet', 'post'),
};

describe('no result', () => {
  it('nothing should render', () => {
    const comp = shallow(<Response {...props} />);

    expect(comp.find('span')).toHaveLength(0);
  });
});

describe('setTab', () => {
  it('setTab should change state of selectedTab', () => {
    const comp = shallow(<Response {...props} />);

    expect(comp.state('responseTab')).toBe('result');

    comp.instance().setTab('metadata');

    expect(comp.state('responseTab')).toBe('metadata');

    comp.instance().setTab('result');

    expect(comp.state('responseTab')).toBe('result');
  });
});

test('should show different component tabs based on state', () => {
  const comp = mount(
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

  expect(comp.find('ResponseBody')).toHaveLength(1);
  comp.instance().setTab('metadata');

  // I want to do the below assertion instead, but it's not working
  // expect(doc.find('ResponseMetadata').length).toBe(1);
  expect(comp.html()).toContain('Response Headers');

  // Should include request body in HTML
  expect(comp.html()).toContain(JSON.stringify({ b: 2 }));
});
