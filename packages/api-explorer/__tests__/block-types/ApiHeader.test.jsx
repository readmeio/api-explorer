const React = require('react');
const { shallow } = require('enzyme');
const ApiHeader = require('../../src/block-types/ApiHeader');

const block = {
  type: 'api-header',
  data: {
    title: 'This is header',
    type: 'post',
  },
};

describe('ApiHeader', () => {
  test('Api Header will render text in table header cells', () => {
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find('h1').text()).toBe('This is header');
  });

  test('should render with the type in a span', () => {
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find(`span.type-${block.data.type}`).length).toBe(1);
  });

  test('should create an #id with the slug of the title', () => {
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find(`span#this-is-header`).length).toBe(1);
    expect(apiHeader.find(`#section-this-is-header`).length).toBe(1);
  });
});
