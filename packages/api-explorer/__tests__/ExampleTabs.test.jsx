const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('oas/tooling');

const example = require('./__fixtures__/example-results/oas.json');
const ExampleTabs = require('../src/ExampleTabs');

const oas = new Oas(example);
const props = {
  selected: 0,
  setCurrentTab: () => {},
};

beforeAll(async () => {
  props.examples = await oas.operation('/results', 'get').getResponseExamples();
});

test('if endpoint has an example, tabs should show', () => {
  const exampleTabs = mount(<ExampleTabs {...props} />);

  expect(exampleTabs.find('a.tabber-tab')).toHaveLength(3);
});

test('should select matching tab by index', () => {
  const exampleTabs = mount(<ExampleTabs {...props} />);

  expect(exampleTabs.find('a').first().hasClass('selected')).toBe(true);
});

test('should call setCurrentTab on click', () => {
  const setCurrentTab = jest.fn();
  const exampleTabs = mount(<ExampleTabs {...props} setCurrentTab={setCurrentTab} />);

  const secondTab = exampleTabs.find('a').last();

  secondTab.simulate('click', { preventDefault() {} });

  expect(setCurrentTab.mock.calls[0][0]).toBe(2);
});

test('should display status codes', () => {
  const exampleTabs = shallow(<ExampleTabs {...props} />);

  expect(exampleTabs.find('IconStatus')).toHaveLength(3);
});
