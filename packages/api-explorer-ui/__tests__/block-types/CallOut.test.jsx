const React = require('react');
const { mount } = require('enzyme');
const CallOut = require('../../src/block-types/CallOut');


describe('CallOut', () => {
  test('Call out will render title if given in props', () => {
    const block = { type: 'callout', data: { type: 'info', title: 'Callout' }, sidebar: undefined };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('h3').text()).toBe('Callout');
  });

  test('Call out will render Icon if no title is given in props', () => {
    const block = { type: 'callout', data: { type: 'info' }, sidebar: undefined };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('span').text()).toBe('');
  });

  // test('Call out will render body of callout is given in props', () => {
  //   const block = { type: 'callout', data: { type: 'info', body: 'you are incorrect' }, sidebar: undefined };
  //   const callOutInput = mount(<CallOut block={block} />);
  //   expect(callOutInput.find('div').text()).toBe('you are incorrect');
  // });
});
