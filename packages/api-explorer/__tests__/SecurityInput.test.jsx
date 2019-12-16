const React = require('react');
const { mount, shallow } = require('enzyme');
const SecurityInput = require('../src/SecurityInput');

const baseProps = {
  auth: {},
  oauth: false,
  onChange: () => {},
};

test('should render an Oauth2 component if type is oauth2', () => {
  const props = { scheme: { type: 'oauth2', _key: 'auth', name: 'auth' } };
  const securityInput = shallow(<SecurityInput {...props} {...baseProps} />);
  expect(securityInput.find('Oauth2')).toHaveLength(1);
});

test('should render an ApiKey component if type is apiKey', () => {
  const props = { scheme: { type: 'apiKey', _key: 'auth', name: 'auth' } };
  const securityInput = shallow(<SecurityInput {...props} {...baseProps} />);
  expect(securityInput.find('ApiKey')).toHaveLength(1);
});

test('should render a Basic component if type is http/basic', () => {
  const props = { scheme: { type: 'http', scheme: 'basic', _key: 'auth', name: 'auth' } };
  const securityInput = shallow(<SecurityInput {...props} {...baseProps} auth={{ auth: {} }} />);
  expect(securityInput.find('Basic')).toHaveLength(1);
});

test('should render an Oauth2 component if type is http/bearer', () => {
  const props = { scheme: { type: 'http', scheme: 'bearer', _key: 'auth', name: 'auth' } };
  const securityInput = shallow(
    <SecurityInput {...props} {...baseProps} auth={{ auth: '123456' }} />,
  );
  expect(securityInput.find('Oauth2')).toHaveLength(1);
});

describe('oauth2', () => {
  const props = { scheme: { type: 'oauth2', _key: 'test-auth' } };

  it('should display authenticate button if no api key and has oauth', () => {
    const securityInput = mount(<SecurityInput {...props} {...baseProps} oauth />);

    expect(securityInput.find('a.btn.btn-primary').text()).toBe('Authenticate via OAuth2');
    expect(securityInput.find('a.btn.btn-primary').prop('href')).toBe(
      `/oauth?redirect=${window.location.pathname}`,
    );
  });

  it('should disable the input if `oauth=true`', () => {
    const securityInput = mount(
      <SecurityInput {...props} {...baseProps} auth={{ 'test-auth': 'test' }} oauth />,
    );
    expect(securityInput.find('input').prop('disabled')).toBe(true);
  });

  it.skip('should disable the input if apiKey is set', () => {
    const securityInput = mount(
      <SecurityInput {...props} {...baseProps} auth={{ 'test-auth': 'test' }} />,
    );
    expect(securityInput.find('input').prop('disabled')).toBe(true);
  });

  it('should display api key if set', () => {
    const apiKey = '123456';
    const securityInput = mount(
      <SecurityInput {...props} {...baseProps} auth={{ 'test-auth': apiKey }} oauth />,
    );

    expect(securityInput.find('input').prop('value')).toBe(apiKey);
  });

  it.skip('should display markdown description', () => {});

  it.skip('should work for multiple oauths and allow selection', () => {});

  it('should send auth apiKey into onChange()', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} {...baseProps} onChange={onChange} />);

    securityInput.find('input[type="text"]').instance().value = '1234';
    securityInput.find('input[type="text"]').simulate('change');

    expect(onChange.mock.calls[0][0]).toStrictEqual({ 'test-auth': '1234' });

    expect(securityInput.find('input[type="text"]').instance().value).toBe('1234');

    securityInput.find('input[type="text"]').instance().value += '56';
    securityInput.find('input[type="text"]').simulate('change');
    expect(onChange.mock.calls[1][0]).toStrictEqual({ 'test-auth': '123456' });
  });
});

describe('apiKey', () => {
  const props = { scheme: { type: 'apiKey', name: 'api_key', _key: 'api_key' } };

  it('should display api key if set', () => {
    const apiKey = '123456';
    const securityInput = mount(
      <SecurityInput {...props} {...baseProps} auth={{ api_key: apiKey }} />,
    );

    expect(securityInput.find('input').prop('value')).toBe(apiKey);
  });

  it('should send auth apiKey into onChange()', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} {...baseProps} onChange={onChange} />);

    securityInput.find('input').instance().value = 'user';
    securityInput.find('input').simulate('change');

    expect(onChange.mock.calls[0][0]).toStrictEqual({ api_key: 'user' });
  });

  it('should display name inside label', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} {...baseProps} onChange={onChange} />);

    expect(securityInput.find('label').text()).toBe('api_key');
  });
});

describe('basic', () => {
  const props = { scheme: { type: 'http', scheme: 'basic', _key: 'test-basic' } };

  it('should send both user/pass into onChange()', () => {
    const onChange = jest.fn();
    const securityInput = mount(
      <SecurityInput {...props} {...baseProps} auth={{ 'test-basic': {} }} onChange={onChange} />,
    );

    securityInput.find('input[name="user"]').instance().value = 'user';
    securityInput.find('input[name="user"]').simulate('change');
    securityInput.find('input[name="pass"]').instance().value = 'pass';
    securityInput.find('input[name="pass"]').simulate('change');

    expect(onChange.mock.calls[0][0]).toStrictEqual({
      'test-basic': {
        user: 'user',
        pass: '',
      },
    });
    expect(onChange.mock.calls[1][0]).toStrictEqual({
      'test-basic': {
        user: '',
        pass: 'pass',
      },
    });
  });

  it('should display user/pass if set', () => {
    const user = 'user';
    const pass = 'pass';
    const securityInput = mount(
      <SecurityInput {...props} {...baseProps} auth={{ 'test-basic': { user, pass } }} oauth />,
    );

    expect(securityInput.find('input[name="user"]').prop('value')).toBe(user);
    expect(securityInput.find('input[name="pass"]').prop('value')).toBe(pass);
  });
});
