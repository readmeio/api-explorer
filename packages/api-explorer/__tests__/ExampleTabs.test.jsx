const React = require('react');
const { shallow, mount } = require('enzyme');
const example = require('./fixtures/example-results/oas');

const ExampleTabs = require('../src/ExampleTabs');
const Oas = require('../src/lib/Oas');
const showCodeResults = require('../src/lib/show-code-results');

const oas = new Oas(example);
const props = {
  examples: showCodeResults(oas.operation('/results', 'get')),
  selected: 0,
  setExampleTab: () => {},
};

test('if endpoint has an example, tabs should show', () => {
  const exampleTabs = mount(<ExampleTabs {...props} />);

  expect(exampleTabs.find('a.tabber-tab').length).toBe(2);
});

test('should select matching tab by index', () => {
  const exampleTabs = mount(<ExampleTabs {...props} />);

  expect(
    exampleTabs
      .find('a')
      .first()
      .hasClass('selected'),
  ).toEqual(true);
});

test('should call setExampleTab on click', () => {
  const setExampleTab = jest.fn();
  const exampleTabs = mount(<ExampleTabs {...props} setExampleTab={setExampleTab} />);

  const secondTab = exampleTabs.find('a').last();

  secondTab.simulate('click', { preventDefault() {} });

  expect(setExampleTab.mock.calls[0][0]).toEqual(1);
});

test('should display status codes', () => {
  const exampleTabs = shallow(<ExampleTabs {...props} />);

  expect(exampleTabs.find('IconStatus').length).toBe(2);
});
