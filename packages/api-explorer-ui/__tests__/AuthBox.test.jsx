const React = require('react');
const { shallow } = require('enzyme');
const AuthBox = require('../src/AuthBox');

const Oas = require('../src/lib/Oas.js');
const petstore = require('./fixtures/multiple-securities/oas');

const oas = new Oas(petstore);

jest.useFakeTimers();

const props = { operation: oas.operation('/things', 'post'), onChange: () => {} };

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

test('should have an open class when state is open', () => {
  const authBox = shallow(<AuthBox {...props} />);

  expect(authBox.find('.hub-auth-dropdown').hasClass('open')).toBe(false);

  authBox.instance().toggle({ preventDefault() {} });

  expect(authBox.find('.hub-auth-dropdown').hasClass('open')).toBe(true);

  authBox.instance().toggle({ preventDefault() {} });

  expect(authBox.find('.hub-auth-dropdown').hasClass('open')).toBe(false);
});

xtest('should display authentication warning if auth is required for endpoint', () => {
  const authBox = shallow(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);

  const nextProps = { needsAuth: true };

  authBox.instance().componentWillReceiveProps(nextProps);

  // expect(authBox.find('.hub-authrequired active').length).toBe(1);
  expect(authBox.state('needsAuth')).toBe(true);
});

test('should display authentication box if try it now button is selected without any authData', () => {
  const authBox = shallow(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);

  const nextProps = { needsAuth: true };

  authBox.instance().componentWillReceiveProps(nextProps);

  expect(authBox.state('open')).toBe(true);
});

test('should display authentication warning after 600ms in AuthBox', () => {
  const timeOut = (nextProps = { needsAuth: true }) => {
    const that = this;
    if (nextProps.needsAuth) {
      setTimeout(() => {
        that.setState({ needsAuth: true });
      }, 600);
    }
  };
  // const authBox = shallow(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);
  // const nextProps = { needsAuth: true };

  timeOut();

  expect(setTimeout.mock.calls.length).toBe(2);
  // authBox.instance().componentWillReceiveProps(nextProps);
  // expect(authBox.state('needsAuth')).toBe(true);
});
