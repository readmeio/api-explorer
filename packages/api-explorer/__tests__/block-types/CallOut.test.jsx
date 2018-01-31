const React = require('react');
const { shallow, mount } = require('enzyme');
const CallOut = require('../../src/block-types/CallOut');

test('should render title', () => {
  const block = {
    data: {
      type: 'info',
      title: 'Callout',
    },
  };
  const callout = mount(<CallOut block={block} />);
  expect(callout.find('h3').text()).toBe('Callout');
});

describe('icons', () => {
  const icons = {
    info: 'info-circle',
    warning: 'exclamation-circle',
    danger: 'exclamation-triangle',
    success: 'check-square',
  };

  test('should render with title', () => {
    Object.keys(icons).forEach(type => {
      const className = icons[type];
      const block = {
        data: {
          type,
          title: 'Callout',
        },
      };
      expect(mount(<CallOut block={block} />).find(`.fa-${className}`).length).toBe(1);
    });
  });

  test('should render without title', () => {
    Object.keys(icons).forEach(type => {
      const className = icons[type];
      const block = {
        data: {
          type,
        },
      };
      expect(mount(<CallOut block={block} />).find(`.noTitleIcon .fa-${className}`).length).toBe(1);
    });
  });
});

test('should render nothing if no title and icon', () => {
  const block = {
    data: {
      type: '',
    },
  };
  const callout = mount(<CallOut block={block} />);
  expect(callout.find('span').text()).toBe('');
});

test('should render body', () => {
  const block = {
    data: {
      type: 'info',
      body: 'body',
    },
  };

  const callout = shallow(<CallOut block={block} />);
  expect(
    callout
      .render()
      .find('.callout-body')
      .html(),
  ).toMatchSnapshot();
});

test('should render markdown in body', () => {
  const block = {
    data: {
      type: 'info',
      body: '# heading\n`test`',
    },
  };

  const callout = shallow(<CallOut block={block} />);
  expect(
    callout
      .render()
      .find('.callout-body')
      .html(),
  ).toMatchSnapshot();
});
