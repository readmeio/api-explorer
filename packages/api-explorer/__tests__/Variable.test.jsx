const React = require('react');
const { shallow } = require('enzyme');

const { Variable } = require('../src/Variable');

describe('single variable', () => {
  test('should render value', () => {
    const variable = shallow(<Variable variable="apiKey" variables={{ apiKey: '123456' }} defaults={[]} />);

    expect(variable.text()).toBe('123456');
  });

  test('should render default if value not set', () => {
    const variable = shallow(<Variable variable="apiKey" variables={{}} defaults={[ { name: 'apiKey', default: 'default' }]} />);

    expect(variable.text()).toBe('default');
  });

  test('should render uppercase if no value and no default', () => {
    const variable = shallow(<Variable variable="apiKey" variables={{}} defaults={[]} />);

    expect(variable.text()).toBe('APIKEY');
  });

  test('should render auth dropdown if default and oauth enabled', () => {
    const variable = shallow(<Variable variable="apiKey" variables={{}} defaults={[ { name: 'apiKey', default: 'default' }]} oauth />);
    variable.find('.variable-underline').simulate('click');

    expect(variable.find('#loginDropdown').length).toBe(1);
  });

  test('should render auth dropdown if no default and oauth enabled', () => {
    const variable = shallow(<Variable variable="apiKey" variables={{}} defaults={[]} oauth />);
    variable.find('.variable-underline').simulate('click');

    expect(variable.find('#loginDropdown').length).toBe(1);
  });

  test('should set `selected` if nothing is selected');
});

describe('multiple variables', () => {
  test('should render the first of multiple values', () => {
    const variable = shallow(
      <Variable
        variable="apiKey"
        variables={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]}
      />,
    );

    expect(variable.text()).toBe('123');
  });

  test('should render whatever the selected name is', () => {
    const variable = shallow(
      <Variable
        variable="apiKey"
        variables={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]}
        selected="project2"
      />,
    );

    expect(variable.text()).toBe('456');
  });

  test('should show dropdown when clicked', () => {
    const variable = shallow(
      <Variable
        variable="apiKey"
        variables={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]}
        selected="project2"
      />,
    );

    variable.find('.variable-underline').simulate('click');

    expect(variable.find('ul li').map(el => el.text())).toEqual(['project1', 'project2']);
  });

  test('should select value when clicked', () => {
    const variable = shallow(
      <Variable
        variable="apiKey"
        variables={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }, { name: 'project3'}]}
        selected="project1"
      />,
    );

    variable.find('.variable-underline').simulate('click');
    variable.find('ul li').at(1).simulate('click', { target: { innerText: variable.find('ul li').at(1).text() } });

    expect(variable.text()).toBe('456');
  });

  test('should render auth dropdown if default and oauth enabled');
});
