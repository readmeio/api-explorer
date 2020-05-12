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
  it('Api Header will render text in table header cells', () => {
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find('h1').text()).toBe('This is header');
  });

  it('should render with the type in a span', () => {
    const apiHeader = shallow(<ApiHeader block={block} />);
    expect(apiHeader.find(`span.type-${block.data.type}`)).toHaveLength(1);
  });

  it('should create an #id with the slug of the title if splitReference', () => {
    const apiHeader = shallow(<ApiHeader block={block} splitReferenceDocs={true} />);
    expect(apiHeader.find(`span#this-is-header`)).toHaveLength(1);
    expect(apiHeader.find(`#section-this-is-header`)).toHaveLength(1);
  });

  it('should not create an #id with the slug of the title if continuous reference', () => {
    const apiHeader = shallow(<ApiHeader block={block} splitReferenceDocs={false} />);
    expect(apiHeader.find(`.fa-anchor`)).toHaveLength(0);
  });
});
