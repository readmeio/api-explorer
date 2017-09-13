const React = require('react');
const { mount } = require('enzyme');
const Code = require('../../src/block-types/Code');

const block = {
  type: 'code',
  sidebar: undefined,
  data: {
    codes: [
      {
        code: 'whjdwhjwejhkwhjk',
        language: 'text',
        status: 400,
        name: 'test',
      },
      {
        code: 'var a = 1',
        language: 'javascript',
      },
    ],
  },
};

const block2 = {

  type: 'code',
  sidebar: undefined,
  data: {
    codes: [
      {
        code: 'var a = 1',
        language: 'javascript',
      },
    ],
  },
};

describe('Code', () => {
  test('Code will render name if provided within em tag if codes has a status', () => {
    const codeInput = mount(<Code block={block} />);
    expect(codeInput.find('em').text()).toBe('test');
  });

  xtest('Code will render language if name or status is not provided within a tag if codes has a status', () => {
    const codeInput = mount(<Code block={block2} />);
    expect(codeInput.find('a').text()).toBe('JavaScript');
  });

  test('Code will render label if provided within opts', () => {
    const codeInput = mount(<Code block={block} opts={{ label: 'label' }} />);
    expect(codeInput.find('label').text()).toBe('label');
  });

  test('Code should switch tabs', () => {
    const codeInput = mount(<Code block={block} opts={{}} />);
    const anchor = codeInput.find('li a').at(1);

    anchor.simulate('click', { preventDefault: () => {} });
    expect(anchor.hasClass('active')).toBe(true);
  });
});
