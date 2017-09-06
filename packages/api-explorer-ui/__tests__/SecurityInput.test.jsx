const React = require('react');
const { shallow } = require('enzyme');
const SecurityInput = require('../src/SecurityInput');

describe('oauth2', () => {
  const props = { scheme: { type: 'oauth2', _key: 'test-auth' }, onChange: () => {} };

  test('should display authenticate button if no api key and has an oauth url', () => {
    const oauthUrl = 'http://example.com/auth';
    const securityInput = shallow(<SecurityInput {...props} oauthUrl={oauthUrl} />);

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
    const securityInput = shallow(<SecurityInput {...props} onChange={onChange} />);

    securityInput.find('input[type="text"]').simulate('change', { currentTarget: { value: '1234' } });

    expect(onChange.mock.calls[0][0]).toEqual({ auth: { 'test-auth': '1234' } });
  });
});
