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
    const node = shallow(<Response {...props} />);

    expect(node.find('span')).toHaveLength(0);
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

test('should correctly handle non-json legacy manual api examples', () => {
  const exampleResponses = [
    {
      status: 200,
      language: 'xml',
      code: '<?xml version="1.0" encoding="UTF-8"?><message>OK</message>',
      name: '',
    },
    {
      name: 'Invalid Credentials',
      status: 200,
      language: 'xml',
      code: '<?xml version="1.0" encoding="UTF-8"?><message>Invalid Credentials</message>',
    },
    {
      status: 404,
      language: 'xml',
      code: '<?xml version="1.0" encoding="UTF-8"?><detail>404 Erroror</detail>',
    },
  ];

  const node = mount(<Response {...props} exampleResponses={exampleResponses} />);

  expect(node.find('ul a')).toHaveLength(2);
  expect(node.find('ul a').at(0).text()).toContain('200 OK');
  expect(node.find('ul a').at(1).text()).toContain('404 Not Found');

  expect(node.find('div.code-sample-body pre')).toHaveLength(2);

  expect(node.find('div.code-sample-body pre').at(0).text()).toContain(exampleResponses[0].code);
  expect(node.find('div.code-sample-body pre').at(0).text()).toContain(exampleResponses[1].code);
  expect(node.find('div.code-sample-body pre').at(1).text()).toContain(exampleResponses[2].code);
});
