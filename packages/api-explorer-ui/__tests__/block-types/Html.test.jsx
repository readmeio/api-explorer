const React = require('react');
const { shallow } = require('enzyme');
const Html = require('../../src/block-types/Html');

const block = {
  type: 'html',
  data: {
    html: '<p>This is an html</p>',
  },
  sidebar: undefined,
};

describe('Html', () => {
  test('should display innerHtml', () => {
    const htmlInput = shallow(<Html block={block} />);
    expect(htmlInput.find('.magic-block-html').length).toBe(1);
    expect(htmlInput.html()).toBe('<div class="magic-block-html"><p>This is an html</p></div>');
  });
});
