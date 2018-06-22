const React = require('react');
const { shallow } = require('enzyme');

const Variable = require('../src/Variable');

test('should render variable', () => {
  const variable = shallow(<Variable value="123456" />);

  expect(variable.text()).toBe('123456');
});

test('should render the first of multiple values', () => {
  const variable = shallow(
    <Variable
      k="apiKey"
      value={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]}
    />,
  );

  expect(variable.text()).toBe('123');
});

test('should render whatever the selected name is', () => {
  const variable = shallow(
    <Variable
      k="apiKey"
      value={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]}
      selected="project2"
    />,
  );

  expect(variable.text()).toBe('456');
});

test('should show dropdown when clicked', () => {
  const variable = shallow(
    <Variable
      k="apiKey"
      value={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }]}
      selected="project2"
    />,
  );

  variable.simulate('click');

  expect(variable.find('ul li').map(el => el.text())).toEqual(['project1', 'project2']);
});

test('should select value when clicked', () => {
  const variable = shallow(
    <Variable
      k="apiKey"
      value={[{ name: 'project1', apiKey: '123' }, { name: 'project2', apiKey: '456' }, { name: 'project3'}]}
      selected="project1"
    />,
  );

  variable.simulate('click');
  variable.find('ul li').at(1).simulate('click', { target: { innerText: variable.find('ul li').at(1).text() } });

  expect(variable.text()).toBe('456');
});

test('should render auth dropdown if default');
