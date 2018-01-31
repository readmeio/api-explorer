const React = require('react');
const { shallow } = require('enzyme');
const IconStatus = require('../src/IconStatus');

test('should display the status', () => {
  const icon = shallow(<IconStatus status={200} />);
  expect(icon.find('span').text()).toContain('200');
});

test('should display the message', () => {
  const icon = shallow(<IconStatus status={200} />);
  expect(icon.find('em').text()).toContain('OK');
});

test('should have httpsuccess class if successful', () => {
  const icon = shallow(<IconStatus status={200} />);
  expect(icon.hasClass('httpsuccess')).toBe(true);
  expect(icon.hasClass('httperror')).toBe(false);
});

test('should have httperror class if unsuccessful', () => {
  const icon = shallow(<IconStatus status={400} />);
  expect(icon.hasClass('httpsuccess')).toBe(false);
  expect(icon.hasClass('httperror')).toBe(true);
});

test('should allow a string', () => {
  const icon = shallow(<IconStatus status="200" />);
  expect(icon.find('span').text()).toContain('200');
});
