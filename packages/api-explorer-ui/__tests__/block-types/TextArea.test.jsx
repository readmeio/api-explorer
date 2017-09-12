const React = require('react');
const { shallow } = require('enzyme');
const TextArea = require('../../src/block-types/TextArea');


describe('TextArea', () => {
  test('Text area will output text', () => {
    const block = {
      type: 'textarea',
      text: 'this is text',
      sidebar: undefined,
    };
    const callOutInput = shallow(<TextArea block={block} />);
    expect(callOutInput.find('div').text()).toBe('this is text');
  });
});
