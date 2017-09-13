const React = require('react');
const { shallow } = require('enzyme');
const ApiHeader = require('../../src/block-types/ApiHeader');

describe('ApiHeader', () => {
  test('Api Header will render text in table header cells', () => {
    const block = {
      type: 'api-header',
      sidebar: undefined,
      data: {
        title: 'This is header',
      },
    };
    const apiHeaderInput = shallow(<ApiHeader block={block} />);
    expect(apiHeaderInput.find('h1').text()).toBe('This is header');
  });
});
