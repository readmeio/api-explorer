const React = require('react');
const { shallow } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');
const string = require('./fixtures/string/oas.json');
const exampleResults = require('./fixtures/example-results/oas');
const extensions = require('@readme/oas-extensions');

const Example = require('../src/Example');
const Oas = require('../src/lib/Oas');

const oas = new Oas(petstore);

const props = {
  result: null,
  oas,
  operation: oas.operation('/pet', 'post'),
  selected: 0,
  setExampleTab: () => {},
};

test('should show no examples if endpoint does not any', () => {
  const example = shallow(<Example {...props} />);

  expect(example.containsMatchingElement(<div>Try the API to see Results</div>)).toEqual(true);
});

test('should notify about no examples being available if explorer disabled', () => {
  const example = shallow(
    <Example
      {...props}
      oas={new Oas(Object.assign({}, petstore, { [extensions.EXPLORER_ENABLED]: false }))}
    />,
  );

  expect(example.containsMatchingElement(<div>No response examples available</div>)).toEqual(true);
});

test('should show each example', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <Example {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />,
  );

  expect(example.find('pre').length).toEqual(2);
});

test('should display json viewer', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <Example {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />,
  );

  // Asserting all JSON examples are displayed with JSON viewer from the example oas.json
  expect(
    example
      .find('pre')
      .at(0)
      .render()
      .find('.react-json-view').length,
  ).toBe(1);
});

test('should not fail to parse invalid json and instead show the standard syntax highlighter', () => {
  const exampleOas = new Oas(string);
  const example = shallow(
    <Example {...props} oas={exampleOas} operation={exampleOas.operation('/format-uuid', 'get')} />,
  );

  // Asserting that instead of failing with the invalid JSON we attempted to render, we fallback
  // to just rendering the string in our standard syntax highlighter.
  expect(
    example
      .find('pre')
      .at(0)
      .render()
      .find('.cm-number').length,
  ).toBe(4);
});

test('should correctly highlight XML syntax', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <Example {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />,
  );

  // Asserting that there are XML tags
  expect(
    example
      .find('pre')
      .at(1)
      .render()
      .find('.cm-tag').length,
  ).toBe(25);
});

test('should show select for multiple response types', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <Example
      {...props}
      oas={exampleOas}
      operation={exampleOas.operation('/multi-media-types', 'get')}
    />,
  );

  const html = example.html();

  expect(html.includes('>Media Types')).toBe(true);
  // is false because the first media type shown is just a text/plain with a single example
  expect(html.includes('>Examples')).toBe(false);
});

test('should show select for multiple response type examples', () => {
  const exampleOas = new Oas(exampleResults);
  const example = shallow(
    <Example
      {...props}
      oas={exampleOas}
      operation={exampleOas.operation('/multi-results', 'get')}
    />,
  );

  const html = example.html();

  expect(html.includes('>Examples')).toBe(true);
  expect(html.includes('>Media Types')).toBe(false);
});
