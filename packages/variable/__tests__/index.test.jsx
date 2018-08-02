const React = require('react');
const { shallow } = require('enzyme');

const { Variable } = require('../index.jsx');

describe('single variable', () => {
  const props = {
    variable: 'apiKey',
    user: { apiKey: '123456' },
    defaults: [],
  };

  test('should render value', () => {
    const variable = shallow(<Variable {...props} />);

    expect(variable.text()).toBe('123456');
  });

  test('should render default if value not set', () => {
    const variable = shallow(
      <Variable {...props} user={{}} defaults={[{ name: 'apiKey', default: 'default' }]} />,
    );

    expect(variable.text()).toBe('default');
  });

  test('should render uppercase if no value and no default', () => {
    const variable = shallow(<Variable {...props} user={{}} defaults={[]} />);

    expect(variable.text()).toBe('APIKEY');
  });

  test('should render auth dropdown if default and oauth enabled', () => {
    const variable = shallow(
      <Variable {...props} user={{}} defaults={[{ name: 'apiKey', default: 'default' }]} oauth />,
    );
    variable.find('.variable-underline').simulate('click');

    expect(variable.find('#loginDropdown').length).toBe(1);
  });

  test('should render auth dropdown if no default and oauth enabled', () => {
    const variable = shallow(<Variable {...props} user={{}} defaults={[]} oauth />);
    variable.find('.variable-underline').simulate('click');

    expect(variable.find('#loginDropdown').length).toBe(1);
  });

  test.skip('should set `selected` if nothing is selected', () => {});
});

describe('multiple variables', () => {
  const props = {
    variable: 'apiKey',
    user: { keys: [{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }] },
    defaults: [],
    selected: '',
    changeSelected: () => {},
  };
  test('should render the first of multiple values', () => {
    const variable = shallow(<Variable {...props} />);

    expect(variable.text()).toBe('123');
  });

  test('should render whatever the selected name is', () => {
    const variable = shallow(<Variable {...props} selected="project2" />);

    expect(variable.text()).toBe('456');
  });

  test('should show dropdown when clicked', () => {
    const variable = shallow(<Variable {...props} selected="project2" />);

    variable.find('.variable-underline').simulate('click');

    expect(variable.find('select option').map(el => el.text())).toEqual(['project1', 'project2']);
  });

  test('should select value when clicked', () => {
    let called = false;
    function changeSelected(selected) {
      expect(selected).toBe('project2');
      called = true;
    }
    const variable = shallow(
      <Variable
        {...props}
        user={{
          keys: [
            { name: 'project1', apiKey: '123' },
            { name: 'project2', apiKey: '456' },
            { name: 'project3' },
          ],
        }}
        selected="project1"
        changeSelected={changeSelected}
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

  test.skip('should render auth dropdown if default and oauth enabled', () => {});
});
