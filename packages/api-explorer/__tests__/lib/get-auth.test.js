const multipleSecurities = require('../fixtures/multiple-securities/oas.json');
const Oas = require('../../src/lib/Oas');
const getAuth = require('../../src/lib/get-auth');

const oas = new Oas(multipleSecurities);

it('should work for || security', () => {
  expect(
    getAuth(
      { oauthScheme: 'oauth', apiKeyScheme: 'apikey' },
      oas.operation('/or-security', 'post'),
    ),
  ).toEqual({ oauthScheme: 'oauth', apiKeyScheme: 'apikey' });
});

it('should work for && security', () => {
  expect(
    getAuth(
      { oauthScheme: 'oauth', apiKeyScheme: 'apikey' },
      oas.operation('/and-security', 'post'),
    ),
  ).toEqual({ oauthScheme: 'oauth', apiKeyScheme: 'apikey' });
});

it('should work for && and || security', () => {
  expect(
    getAuth(
      { oauthScheme: 'oauth', apiKeyScheme: 'apikey', oauthDiff: 'oauthDiff' },
      oas.operation('/and-or-security', 'post'),
    ),
  ).toEqual({ oauthScheme: 'oauth', apiKeyScheme: 'apikey', oauthDiff: 'oauthDiff' });
});

it('should work for single auth', () => {
  expect(getAuth({ apiKeyScheme: 'apikey' }, oas.operation('/single-auth', 'post'))).toEqual({
    apiKeyScheme: 'apikey',
  });
});

it('should work for no auth', () => {
  expect(getAuth({}, oas.operation('/no-auth', 'post'))).toEqual({});
});

it('should work for unknown auth type', () => {
  expect(getAuth({}, oas.operation('/unknown-auth-type', 'post'))).toEqual({
    unknownAuthType: null,
  });
});

const { getSingle } = getAuth;

const topLevelUser = { apiKey: '123456', user: 'user', pass: 'pass' };
const keysUser = { keys: [{ apiKey: '123456', name: 'app-1' }, { apiKey: '7890', name: 'app-2' }] };
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

it('should return user/pass properties for basic auth', () => {
  expect(getSingle(topLevelUser, { type: 'http', scheme: 'basic' })).toEqual({
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
  expect(getSingle(keysSchemeUser, { type: 'oauth2', _key: 'schemeName' })).toBe('scheme-key-1');
  expect(getSingle(keysSchemeUser, { type: 'oauth2', _key: 'schemeName' }, 'app-2')).toBe(
    'scheme-key-2',
  );
  expect(getSingle(keysSchemeUser, { type: 'http', _key: 'schemeName' }, 'app-3')).toEqual({
    user: 'user',
    pass: 'pass',
  });
});

it('should return null for anything else', () => {
  expect(getSingle(topLevelUser, { type: 'unknown' })).toBe(null);
  expect(getSingle(keysUser, { type: 'unknown' })).toBe(null);
  expect(getSingle(keysUser, { type: 'unknown' }, 'app-2')).toBe(null);
});

it('should allow scheme to be undefined', () => {
  expect(getSingle(topLevelUser)).toBe(null);
});
