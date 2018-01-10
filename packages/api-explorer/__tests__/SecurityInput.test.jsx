const React = require('react');
const { mount, shallow } = require('enzyme');
const SecurityInput = require('../src/SecurityInput');

test('should render an Oauth2 component if type is oauth2', () => {
  const props = { scheme: { type: 'oauth2', _key: 'auth', name: 'auth' }, onChange: () => {} };
  const securityInput = shallow(<SecurityInput {...props} />);
  expect(securityInput.find('Oauth2').length).toBe(1);
});

test('should render an ApiKey component if type is apiKey', () => {
  const props = { scheme: { type: 'apiKey', _key: 'auth', name: 'auth' }, onChange: () => {} };
  const securityInput = shallow(<SecurityInput {...props} />);
  expect(securityInput.find('ApiKey').length).toBe(1);
});

test('should render a Basic component if type is http', () => {
  const props = { scheme: { type: 'http', _key: 'auth', name: 'auth' }, onChange: () => {} };
  const securityInput = shallow(<SecurityInput {...props} />);
  expect(securityInput.find('Basic').length).toBe(1);
});

describe('oauth2', () => {
  const props = { scheme: { type: 'oauth2', _key: 'test-auth' }, onChange: () => {} };

  test('should display authenticate button if no api key and has an oauth url', () => {
    const oauthUrl = 'http://example.com/auth';
    const securityInput = mount(<SecurityInput {...props} oauthUrl={oauthUrl} />);

    expect(securityInput.find('a.btn.btn-primary').text()).toBe('Authenticate via OAuth2');
    expect(securityInput.find('a.btn.btn-primary').prop('href')).toBe(oauthUrl);
  });

  test.skip('should display oauth input if api key', () => {
    const apiKey = '123456';
    const securityInput = shallow(<SecurityInput {...props} apiKey={apiKey} />);

    expect(securityInput.find('input[type="text"]').prop('value')).toBe(apiKey);
  });

  test('should display markdown description');
  test('should work for multiple oauths and allow selection');

  test('should send auth apiKey into onChange()', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} onChange={onChange} />);

    securityInput.find('input[type="text"]').instance().value = '1234';
    securityInput.find('input[type="text"]').simulate('change');

    expect(onChange.mock.calls[0][0]).toEqual({ 'test-auth': '1234' });
  });
});

describe('apiKey', () => {
  const props = {
    scheme: { type: 'apiKey', name: 'api_key', _key: 'api_key' },
    onChange: () => {},
  };

  test('should send auth apiKey into onChange()', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} onChange={onChange} />);

    securityInput.find('input').instance().value = 'user';
    securityInput.find('input').simulate('change');

    expect(onChange.mock.calls[0][0]).toEqual({ api_key: 'user' });
  });
  test('should display name inside label', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} onChange={onChange} />);

    expect(securityInput.find('label').text()).toBe('api_key');
  });
});

describe('basic', () => {
  const props = {
    scheme: { type: 'http', scheme: 'basic', _key: 'test-basic' },
    onChange: () => {},
  };

  test('should send auth apiKey into onChange()', () => {
    const onChange = jest.fn();
    const securityInput = mount(<SecurityInput {...props} onChange={onChange} />);

    securityInput.find('input[name="user"]').instance().value = 'user';
    securityInput.find('input[name="user"]').simulate('change');
    securityInput.find('input[name="password"]').instance().value = 'pass';
    securityInput.find('input[name="password"]').simulate('change');

    expect(onChange.mock.calls[1][0]).toEqual({
      'test-basic': {
        user: 'user',
        password: 'pass',
      },
    });
  });
});
