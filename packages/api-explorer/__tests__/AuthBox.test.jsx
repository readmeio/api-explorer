const React = require('react');
const { shallow, mount } = require('enzyme');
const Oas = require('oas');

const AuthBox = require('../src/AuthBox');

const multipleSecurities = require('./fixtures/multiple-securities/oas');

const oas = new Oas(multipleSecurities);

const props = {
  auth: {},
  oauth: false,
  open: false,
  operation: oas.operation('/or-security', 'post'),
  onChange: () => {},
  onGroupChange: () => {},
  onSubmit: () => {},
  toggle: () => {},
};

test('should not display if no auth', () => {
  expect(
    shallow(<AuthBox {...props} operation={oas.operation('/no-auth', 'post')} />).html(),
  ).toBeNull();
});

test('should display a single heading heading for single auth type', () => {
  const authBox = mount(<AuthBox {...props} operation={oas.operation('/single-auth', 'post')} />);
  expect(authBox.find('h3')).toHaveLength(1);
  expect(authBox.find('h3').text()).toBe('Header Auth');
});

test('should display a heading for each auth type with dropdown', () => {
  const authBox = mount(<AuthBox {...props} />);
  expect(authBox.find('h3')).toHaveLength(2);
  expect(authBox.find('h3').map(h3 => h3.text())).toStrictEqual(['OAuth2 Auth', 'Header Auth']);
});

test.skip('should display a dropdown for when multiple oauths are present', () => {
  const authBox = shallow(<AuthBox {...props} path="/multiple-oauths" />);

  expect(authBox.find('select option')).toHaveLength(2);
  expect(authBox.find('select option').map(option => option.text())).toStrictEqual([
    'oauth',
    'oauthDiff',
  ]);
});

test('should mask password inputs for basic http auth', () => {
  const authBox = mount(<AuthBox {...props} operation={oas.operation('/and-security', 'post')} />);
  expect(authBox.find('h3')).toHaveLength(3);
  expect(authBox.find('input[type="password"]')).toHaveLength(1);
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

  expect(authBox.find('SecurityInput')).toHaveLength(2);
});

describe('group selection', () => {
  const groupProps = {
    group: 'someid',
    groups: [
      { id: '1230', name: 'someid' },
      { id: '7000', name: 'anotherId' },
    ],
  };

  it('should only display a single dropdown regardless of the number of securities', () => {
    const comp = mount(<AuthBox {...props} {...groupProps} />);

    expect(comp.find('select')).toHaveLength(1);
  });

  it('should update auth on changes', () => {
    const comp = mount(<AuthBox {...props} {...groupProps} onGroupChange={jest.fn()} />);

    const select = comp.find('select');
    select.instance().value = '7000';
    select.simulate('change');

    expect(comp.props().onGroupChange).toHaveBeenCalledWith('7000');
  });
});
