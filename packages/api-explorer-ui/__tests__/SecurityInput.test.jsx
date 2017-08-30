const React = require('react');
const { shallow } = require('enzyme');
const SecurityInput = require('../src/SecurityInput');

describe('oauth2', () => {
  test('should display authenticate button if no api key and has an oauth url', () => {
    const oauthUrl = 'http://example.com/auth';
    const securityInput = shallow(<SecurityInput scheme={{ type: 'oauth2' }} oauthUrl={oauthUrl} />);

    expect(securityInput.find('a.btn.btn-primary').text()).toBe('Authenticate via OAuth2');
    expect(securityInput.find('a.btn.btn-primary').prop('href')).toBe(oauthUrl);
  });

  test('should display oauth input if api key', () => {
    const apiKey = '123456';
    const securityInput = shallow(<SecurityInput scheme={{ type: 'oauth2' }} apiKey={apiKey} />);

    expect(securityInput.find('input[type="text"]').prop('value')).toBe(apiKey);
  });

  test('should display markdown description');
  test('should work for multiple oauths and allow selection');
});

