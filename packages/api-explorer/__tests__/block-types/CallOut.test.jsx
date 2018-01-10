const React = require('react');
const { shallow, mount } = require('enzyme');
const CallOut = require('../../src/block-types/CallOut');

describe('CallOut', () => {
  test('Call out will render title and icon info if given in props', () => {
    const block = {
      type: 'callout',
      data: {
        type: 'info',
        title: 'Callout',
      },
      sidebar: undefined,
    };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('h3').text()).toBe('Callout');
  });

  test('Call out will render title and icon success if given in props', () => {
    const block = {
      type: 'callout',
      data: {
        type: 'success',
        title: 'Callout',
      },
      sidebar: undefined,
    };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('h3').text()).toBe('Callout');
  });

  test('Call out will render Icon if no title is given in props', () => {
    const block = {
      type: 'callout',
      data: {
        type: 'danger',
      },
      sidebar: undefined,
    };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('span').html()).toBe(
      '<span class="noTitleIcon"><i class="fa fa-exclamation-triangle" title="Danger"></i></span>',
    );
  });

  test('Call out will render Icon if no title is given in props', () => {
    const block = {
      type: 'callout',
      data: {
        type: 'warning',
      },
      sidebar: undefined,
    };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('span').html()).toBe(
      '<span class="noTitleIcon"><i class="fa fa-exclamation-circle" title="Warning"></i></span>',
    );
  });

  test('Call out will render nothing if no title and icon type isn not given is given in props', () => {
    const block = {
      type: 'callout',
      data: {
        type: '',
      },
      sidebar: undefined,
    };
    const callOutInput = mount(<CallOut block={block} />);
    expect(callOutInput.find('span').text()).toBe('');
  });

  test('Call out will render body of callout is given in props', () => {
    const block = {
      type: 'callout',
      data: {
        type: 'info',
        body: 'you are incorrect',
      },
      sidebar: undefined,
    };

    const callOutInput = shallow(<CallOut block={block} />);
    expect(callOutInput.find('div.callout-body').text()).toBe('you are incorrect');
  });
});
