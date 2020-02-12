const Oas = require('oas');

const multipleSecurities = require('../fixtures/multiple-securities/oas.json');
const getAuth = require('../../src/lib/get-auth');

const oas = new Oas(multipleSecurities);

test('should fetch all auths from the OAS files', () => {
  expect(getAuth({ oauthScheme: 'oauth', apiKeyScheme: 'apikey' }, { 'api-setting': oas })).toStrictEqual({
    oauthScheme: 'oauth',
    oauthDiff: '',
    apiKeyScheme: 'apikey',
    unknownAuthType: '',
    basicAuth: {
      pass: '',
      user: '',
    },
  });
});

test('should fetch auths from selected app', () => {
  const user = {
    keys: [
      { oauthScheme: '111', name: 'app-1' },
      { oauthScheme: '222', name: 'app-2' },
    ],
  };

  expect(getAuth(user, { 'api-setting': oas }, 'app-2').oauthScheme).toBe('222');
});

test('should not error if oas.components is not set', () => {
  expect(() => {
    getAuth({ oauthScheme: 'oauth', apiKeyScheme: 'apikey' }, { 'api-setting': {} });
  }).not.toThrow();

  expect(() => {
    getAuth({ oauthScheme: 'oauth', apiKeyScheme: 'apikey' }, { 'api-setting': { components: {} } });
  }).not.toThrow();

  expect(() => {
    getAuth({ oauthScheme: 'oauth', apiKeyScheme: 'apikey' }, { 'api-setting': { components: { requestBodies: {} } } });
  }).not.toThrow();
});

describe('#getSingle', () => {
  const { getSingle } = getAuth;

  const topLevelUser = { apiKey: '123456', user: 'user', pass: 'pass' };
  const keysUser = {
    keys: [
      { apiKey: '123456', name: 'app-1' },
      { apiKey: '7890', name: 'app-2' },
    ],
  };
  const topLevelSchemeUser = { schemeName: 'scheme-key' };
  const keysSchemeUser = {
    keys: [
      { schemeName: 'scheme-key-1', name: 'app-1' },
      { schemeName: 'scheme-key-2', name: 'app-2' },
      { schemeName: { user: 'user', pass: 'pass' }, name: 'app-3' },
    ],
  };

  it('should return apiKey property for oauth', () => {
    expect(getSingle(topLevelUser, { type: 'oauth2' })).toBe('123456');
  });

  it('should return apiKey property for apiKey', () => {
    expect(getSingle(topLevelUser, { type: 'oauth2' })).toBe('123456');
  });

  it('should return a default value if scheme is sec0 and default auth provided', () => {
    expect(getSingle({}, { type: 'apiKey', _key: 'sec0', 'x-default': 'default' })).toBe('default');
  });

  it('should return apiKey property for bearer', () => {
    expect(getSingle(topLevelUser, { type: 'http', scheme: 'bearer' })).toBe('123456');
  });

  it('should return user/pass properties for basic auth', () => {
    expect(getSingle(topLevelUser, { type: 'http', scheme: 'basic' })).toStrictEqual({
      user: 'user',
      pass: 'pass',
    });
  });

  it('should return first item from keys array if no app selected', () => {
    expect(getSingle(keysUser, { type: 'oauth2' })).toBe('123456');
  });

  it('should return selected app from keys array if app provided', () => {
    expect(getSingle(keysUser, { type: 'oauth2' }, 'app-2')).toBe('7890');
  });

  it('should return item by scheme name if no apiKey/user/pass', () => {
    expect(getSingle(topLevelSchemeUser, { type: 'oauth2', _key: 'schemeName' })).toBe('scheme-key');
    expect(getSingle(topLevelSchemeUser, { type: 'http', scheme: 'bearer', _key: 'schemeName' })).toBe('scheme-key');
    expect(getSingle(keysSchemeUser, { type: 'oauth2', _key: 'schemeName' })).toBe('scheme-key-1');
    expect(getSingle(keysSchemeUser, { type: 'oauth2', _key: 'schemeName' }, 'app-2')).toBe('scheme-key-2');
    expect(getSingle(keysSchemeUser, { type: 'http', scheme: 'basic', _key: 'schemeName' }, 'app-3')).toStrictEqual({
      user: 'user',
      pass: 'pass',
    });
  });

  it('should return emptystring for anything else', () => {
    expect(getSingle(topLevelUser, { type: 'unknown' })).toBe('');
    expect(getSingle({}, { type: 'http', scheme: 'basic' })).toStrictEqual({ user: '', pass: '' });
    expect(getSingle({}, { type: 'http', scheme: 'bearer' })).toBe('');
    expect(getSingle({}, { type: 'http', scheme: 'unknown' })).toBe('');
    expect(getSingle(keysUser, { type: 'unknown' })).toBe('');
    expect(getSingle(keysUser, { type: 'unknown' }, 'app-2')).toBe('');
  });

  it('should allow scheme to be undefined', () => {
    expect(getSingle(topLevelUser)).toBe('');
  });
});
