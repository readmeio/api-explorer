const React = require('react');
const { shallow } = require('enzyme');
const example = require('./fixtures/example-results/oas');

const ExampleTabs = require('../src/ExampleTabs');
const Oas = require('../src/lib/Oas');

describe('examples', () => {
  test('if endpoint has an example, tabs and body should show', () => {
    const oas2 = new Oas(example);
    const props4 = {
      result: null,
      operation: oas2.operation('/results', 'get'),
    };
    const exampleTabs = shallow(<ExampleTabs {...props4} oas={oas2} />);

    const firstTab = exampleTabs.find('a').first();
    const secondTab = exampleTabs.find('a').last();

    expect(exampleTabs.prop('exampleTab')).toBe(0);
    expect(firstTab.hasClass('selected')).toEqual(true);

    secondTab.simulate('click', { preventDefault() {} });

    expect(exampleTabs.prop('exampleTab')).toBe(1);
    expect(
      exampleTabs
        .find('a')
        .first()
        .hasClass('selected'),
    ).toEqual(false);

    expect(firstTab.find('span.httpsuccess').length).toBe(1);
    expect(secondTab.find('span.httperror').length).toBe(1);

    expect(exampleTabs.find('pre').length).toBe(2);
  });
});
