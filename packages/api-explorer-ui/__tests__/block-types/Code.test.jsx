const React = require('react');
const { mount } = require('enzyme');
const Code = require('../../src/block-types/Code');


describe('Code', () => {
  test('Code will render name if provided within em tag', () => {
    const data = { type: 'code',
      sidebar: undefined,
      codes: [{
        code: 'whjdwhjwejhkwhjk',
        language: 'text',
        status: 400,
        name: 'test',
      }] };
    const codeInput = mount(<Code data={data} />);
    expect(codeInput.find('em').text()).toBe('test');
  });
});
