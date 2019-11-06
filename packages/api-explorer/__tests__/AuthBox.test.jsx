const React = require('react');
const { shallow, mount } = require('enzyme');
const AuthBox = require('../src/AuthBox');

const Oas = require('../src/lib/Oas.js');
const multipleSecurities = require('./fixtures/multiple-securities/oas');

const oas = new Oas(multipleSecurities);

const props = {
  auth: {},
  oauth: false,
  open: false,
  operation: oas.operation('/or-security', 'post'),
  onChange: () => {},
  onSubmit: () => {},
  toggle: () => {},
};

test('should not display if no auth', () => {
  expect(shallow(<AuthBox {...props} operation={oas.operation('/no-auth', 'post')} />).html()).toBe(
    null,
  );
});

test('should display a single heading heading for single auth type', () => {
  const authBox = mount(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);
  expect(authBox.find('h3').length).toBe(1);
  expect(authBox.find('h3').text()).toBe('Header Auth');
});

test('should display a heading for each auth type with dropdown', () => {
  const authBox = mount(<AuthBox {...props} />);
  expect(authBox.find('h3').length).toBe(2);
  expect(authBox.find('h3').map(h3 => h3.text())).toEqual(['OAuth2 Auth', 'Header Auth']);
});

test.skip('should display a dropdown for when multiple oauths are present', () => {
  const authBox = shallow(<AuthBox {...props} path="/multiple-oauths" />);

  expect(authBox.find('select option').length).toBe(2);
  expect(authBox.find('select option').map(option => option.text())).toEqual([
    'oauth',
    'oauthDiff',
  ]);
});

test('should not display authentication warning if authData is passed', () => {
  const authBox = mount(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);

  authBox.setProps({ needsAuth: false });

  expect(authBox.props().open).toBe(false);
});

test('should hide authbox if open=false', () => {
  const authBox = mount(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);

  authBox.setProps({ needsAuth: true });
  authBox.setProps({ needsAuth: false });

  expect(authBox.props().open).toBe(false);
});

test('should display multiple securities', () => {
  const authBox = mount(<AuthBox {...props} />);

  expect(authBox.find('SecurityInput').length).toBe(2);
});
