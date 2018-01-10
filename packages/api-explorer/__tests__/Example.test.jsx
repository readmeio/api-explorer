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
