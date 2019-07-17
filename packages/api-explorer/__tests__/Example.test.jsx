const React = require('react');
const { shallow } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');
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
      operation={exampleOas.operation('/multi-results', 'get')}
    />,
  );

  expect(example.html().includes('<select')).toBe(true);
});
