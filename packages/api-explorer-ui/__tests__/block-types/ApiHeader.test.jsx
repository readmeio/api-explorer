const React = require('react');
const { shallow } = require('enzyme');
const ApiHeader = require('../../src/block-types/ApiHeader');

describe('ApiHeader', () => {
  test('Api Header will render text in table header cells', () => {
    const block = {
      type: 'api-header',
      data: {
        title: 'This is header',
      },
    };
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find('h1').text()).toBe('This is header');
  });

  test('should render with the type in a span', () => {
    const type = 'post';
    const block = {
      type: 'api-header',
      data: {
        title: 'This is header',
        type,
      },
    };
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find(`span.type-${type}`).length).toBe(1);
  });
});
