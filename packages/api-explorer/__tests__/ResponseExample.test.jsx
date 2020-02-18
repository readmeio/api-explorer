const React = require('react');
const { shallow } = require('enzyme');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas');

const petstore = require('./fixtures/petstore/oas');
const string = require('./fixtures/string/oas.json');
const exampleResults = require('./fixtures/example-results/oas');

const ResponseExample = require('../src/ResponseExample');

const oas = new Oas(petstore);

const props = {
  oas,
  onChange: () => {},
  operation: oas.operation('/pet', 'post'),
  result: null,
};

test('should show no examples if endpoint does not any', () => {
  const example = shallow(<ResponseExample {...props} />);

  expect(example.containsMatchingElement(<div>Try the API to see Results</div>)).toBe(true);
});

test('should notify about no examples being available if explorer disabled', () => {
  const example = shallow(
    <ResponseExample {...props} oas={new Oas({ ...petstore, [extensions.EXPLORER_ENABLED]: false })} />
  );

  expect(example.containsMatchingElement(<div>No response examples available</div>)).toBe(true);
});

test('should show each example', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />
  );

  expect(example.find('pre')).toHaveLength(2);
});

test('should display json viewer', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />
  );

  // Asserting all JSON examples are displayed with JSON viewer from the example oas.json
  expect(
    example
      .find('pre')
      .at(0)
      .render()
      .find('.react-json-view')
  ).toHaveLength(1);
});

test('should not fail to parse invalid json and instead show the standard syntax highlighter', () => {
  const exampleOas = new Oas(string);
  const example = shallow(
    <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/format-uuid', 'get')} />
  );

  // Asserting that instead of failing with the invalid JSON we attempted to render, we fallback
  // to just rendering the string in our standard syntax highlighter.
  expect(
    example
      .find('pre')
      .at(0)
      .render()
      .find('.cm-number')
  ).toHaveLength(4);
});

test('should correctly highlight XML syntax', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />
  );

  // Asserting that there are XML tags
  expect(
    example
      .find('pre')
      .at(1)
      .render()
      .find('.cm-tag')
  ).toHaveLength(25);
});

test('should show select for multiple examples on a single media type', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <ResponseExample
      {...props}
      oas={exampleOas}
      operation={exampleOas.operation('/single-media-type-multiple-examples', 'get')}
    />
  );

  const html = example.html();

  expect(html).not.toContain('>Response type');
  expect(html).toContain('>Choose an example');
});

test('should not show a select if a media type has a single example', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <ResponseExample
      {...props}
      oas={exampleOas}
      operation={exampleOas.operation('/single-media-type-single-example', 'get')}
    />
  );

  expect(example.html()).not.toContain('<select');
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

  const example = shallow(<ResponseExample {...props} exampleResponses={exampleResponses} />);

  const html = example.html();

  expect(html).not.toContain('>Response type');
  expect(html).toContain('>Choose an example');
});

describe('exampleTab', () => {
  it('exampleTab should change state of exampleTab', () => {
    const doc = shallow(<ResponseExample {...props} />);

    expect(doc.state('exampleTab')).toBe(0);

    doc.instance().setExampleTab(1);

    expect(doc.state('exampleTab')).toBe(1);
  });
});
