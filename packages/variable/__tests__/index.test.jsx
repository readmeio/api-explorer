const React = require('react');
const { shallow } = require('enzyme');

const { Variable } = require('../index.jsx');

describe('single variable', () => {
  const props = {
    variable: 'apiKey',
    user: { apiKey: '123456' },
    defaults: [],
    changeSelected: () => {},
    selected: '',
  };

  it('should render value', () => {
    const variable = shallow(<Variable {...props} />);

    expect(variable.text()).toBe('123456');
  });

  it('should render default if value not set', () => {
    const variable = shallow(
      <Variable {...props} defaults={[{ name: 'apiKey', default: 'default' }]} user={{}} />,
    );

    expect(variable.text()).toBe('default');
  });

  it('should render uppercase if no value and no default', () => {
    const variable = shallow(<Variable {...props} defaults={[]} user={{}} />);

    expect(variable.text()).toBe('APIKEY');
  });

  it('should render auth dropdown if default and oauth enabled', () => {
    const variable = shallow(
      <Variable {...props} defaults={[{ name: 'apiKey', default: 'default' }]} oauth user={{}} />,
    );
    variable.find('.variable-underline').simulate('click');

    expect(variable.find('#loginDropdown')).toHaveLength(1);
  });

  it('should render auth dropdown if no default and oauth enabled', () => {
    const variable = shallow(<Variable {...props} defaults={[]} oauth user={{}} />);
    variable.find('.variable-underline').simulate('click');

    expect(variable.find('#loginDropdown')).toHaveLength(1);
  });

  it.skip('should set `selected` if nothing is selected', () => {});
});

describe('multiple variables', () => {
  const props = {
    variable: 'apiKey',
    user: {
      keys: [
        { name: 'project1', apiKey: '123' },
        { name: 'project2', apiKey: '456' },
      ],
    },
    defaults: [],
    selected: '',
    changeSelected: () => {},
  };
  it('should render the first of multiple values', () => {
    const variable = shallow(<Variable {...props} />);

    expect(variable.text()).toBe('123');
  });

  it('should render whatever the selected name is', () => {
    const variable = shallow(<Variable {...props} selected="project2" />);

    expect(variable.text()).toBe('456');
  });

  it('should show dropdown when clicked', () => {
    const variable = shallow(<Variable {...props} selected="project2" />);

    variable.find('.variable-underline').simulate('click');

    expect(variable.find('select option').map(el => el.text())).toStrictEqual([
      'project1',
      'project2',
    ]);
  });

  it('should select value when clicked', () => {
    let called = false;
    function changeSelected(selected) {
      expect(selected).toBe('project2');
      called = true;
    }
    const variable = shallow(
      <Variable
        {...props}
        changeSelected={changeSelected}
        selected="project1"
        user={{
          keys: [
            { name: 'project1', apiKey: '123' },
            { name: 'project2', apiKey: '456' },
            { name: 'project3' },
          ],
        }}
      />,
    );

    variable.find('.variable-underline').simulate('click');
    variable.find('select').simulate('change', {
      target: {
        value: variable
          .find('select option')
          .at(1)
          .text(),
      },
    });

    expect(called).toBe(true);

    expect(variable.state('showDropdown')).toBe(false);
  });

  it.skip('should render auth dropdown if default and oauth enabled', () => {});
});
