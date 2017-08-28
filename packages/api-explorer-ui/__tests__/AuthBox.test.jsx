const React = require('react');
const { shallow } = require('enzyme');
const AuthBox = require('../src/AuthBox');

const Oas = require('../src/lib/Oas.js');
const petstore = require('./fixtures/multiple-securities/oas');

const oas = new Oas(petstore);
const path = '/things';
const method = 'post';

const props = { oas, path, method };

test('should not display if no auth', () => {
  expect(shallow(<AuthBox {...props} path="/no-auth" />).html()).toBe(null);
});

test('should display a single heading heading for single auth type', () => {
  const authBox = shallow(<AuthBox {...props} path="/single-auth" />);
  expect(authBox.find('h3').length).toBe(1);
  expect(authBox.find('h3').text()).toBe('Header Auth');
});

test('should display a heading for each auth type with dropdown', () => {
  const authBox = shallow(<AuthBox {...props} />);
  expect(authBox.find('h3').length).toBe(2);
  expect(authBox.find('h3').map(h3 => h3.text())).toEqual(['OAuth2 Auth', 'Header Auth']);
});

test('should display a dropdown for when multiple oauths are present', () => {
  const authBox = shallow(<AuthBox {...props} path="/multiple-oauths" />);

  expect(authBox.find('select option').length).toBe(2);
  expect(authBox.find('select option').map(option => option.text())).toEqual(['oauth', 'oauthDiff']);
});

test.skip('should be able to be opened by clicking padlock', () => {
  const authBox = shallow(<AuthBox {...props} />);

  expect(authBox.find('div.nopad').hasClass('open')).toBe(false);

  authBox.find('hub-auth-dropdown').simulate('click', { preventDefault: () => {} });

  expect(authBox.find('div.nopad').hasClass('open')).toBe(true);

  authBox.find('hub-auth-dropdown').simulate('click', { preventDefault: () => {} });

  expect(authBox.find('div.nopad').hasClass('open')).toBe(false);
});
