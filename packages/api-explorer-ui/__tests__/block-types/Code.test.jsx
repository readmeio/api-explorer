const React = require('react');
const { mount } = require('enzyme');
const Code = require('../../src/block-types/Code');


describe('Code', () => {
  test('Code will render name if provided within em tag', () => {
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
    const codeInput = mount(<Code block={block} />);
    expect(codeInput.find('em').text()).toBe('test');
  });

  test('Code should switch tabs', () => {
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
    const codeInput = mount(<Code block={block} opts={{}} />);

    const anchor = codeInput.find('li a').at(1);

    anchor.simulate('click', { preventDefault: () => {} });
    expect(anchor.hasClass('active')).toBe(true);
  });
});
