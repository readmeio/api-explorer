const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('oas');

const example = require('./fixtures/example-results/oas');

const ExampleTabs = require('../src/ExampleTabs');
const showCodeResults = require('../src/lib/show-code-results');

const oas = new Oas(example);
const props = {
  examples: showCodeResults(oas.operation('/results', 'get'), oas),
  selected: 0,
  setExampleTab: () => {},
};

test('if endpoint has an example, tabs should show', () => {
  const exampleTabs = mount(<ExampleTabs {...props} />);

  expect(exampleTabs.find('a.tabber-tab')).toHaveLength(2);
});

test('should select matching tab by index', () => {
  const exampleTabs = mount(<ExampleTabs {...props} />);

  expect(
    exampleTabs
      .find('a')
      .first()
      .hasClass('selected')
  ).toBe(true);
});

test('should call setExampleTab on click', () => {
  const setExampleTab = jest.fn();
  const exampleTabs = mount(<ExampleTabs {...props} setExampleTab={setExampleTab} />);

  const secondTab = exampleTabs.find('a').last();

  secondTab.simulate('click', { preventDefault() {} });

  expect(setExampleTab.mock.calls[0][0]).toBe(1);
});

test('should display status codes', () => {
  const exampleTabs = shallow(<ExampleTabs {...props} />);

  expect(exampleTabs.find('IconStatus')).toHaveLength(2);
});
