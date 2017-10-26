const React = require('react');
const { shallow, mount } = require('enzyme');
const AuthBox = require('../src/AuthBox');

const Oas = require('../src/lib/Oas.js');
const petstore = require('./fixtures/multiple-securities/oas');

const oas = new Oas(petstore);

const props = {
  operation: oas.operation('/things', 'post'),
  onChange: () => {},
  onSubmit: () => {},
  toggle: () => {},
  open: false,
};

test('should not display if no auth', () => {
  expect(shallow(<AuthBox {...props} operation={oas.operation('/no-auth', 'post')} />).html()).toBe(
    null,
  );
});

test('should display a single heading heading for single auth type', () => {
  const authBox = shallow(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);
  expect(authBox.find('h3').length).toBe(1);
  expect(authBox.find('h3').text()).toBe('Header Auth');
});

test('should display a heading for each auth type with dropdown', () => {
  const authBox = shallow(<AuthBox {...props} />);
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
  const authBox = shallow(<AuthBox {...props} />);

  expect(authBox.find('SecurityInput').length).toBe(2);
});

test('should merge securities auth changes', () => {
  const onChange = jest.fn();
  const authBox = mount(<AuthBox {...props} onChange={onChange} />);

  authBox
    .find('ApiKey')
    .props()
    .change('auth');
  authBox
    .find('Oauth2')
    .props()
    .change('auth');

  expect(onChange.mock.calls[0][0]).toEqual({ auth: { apiKey: 'auth' } });
  expect(onChange.mock.calls[1][0]).toEqual({ auth: { apiKey: 'auth', oauth: 'auth' } });
});
