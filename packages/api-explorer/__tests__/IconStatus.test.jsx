const React = require('react');
const { shallow } = require('enzyme');
const IconStatus = require('../src/IconStatus');

test('should display the status', () => {
  const icon = shallow(<IconStatus status={200} />);
  expect(icon.find('span').at(0).text()).toContain('200');
});

test('should display the message', () => {
  const icon = shallow(<IconStatus status={200} />);
  expect(icon.find('em').text()).toContain('OK');
});

test('should allow a string', () => {
  const icon = shallow(<IconStatus status="200" />);
  expect(icon.find('span').at(0).text()).toContain('200');
});
