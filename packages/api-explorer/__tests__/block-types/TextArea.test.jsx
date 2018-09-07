const React = require('react');
const { shallow } = require('enzyme');
const TextArea = require('../../src/block-types/TextArea');

describe('TextArea', () => {
  test('Text area will output text', () => {
    const block = {
      type: 'textarea',
      text: 'this is text',
    };
    const textArea = shallow(<TextArea block={block} />);
    expect(textArea.find('p').text()).toBe(block.text);
  });
});
