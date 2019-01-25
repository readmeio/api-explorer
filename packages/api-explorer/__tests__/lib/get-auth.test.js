const getAuth = require('../../src/lib/get-auth');

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
  expect(getAuth(topLevelUser, { type: 'oauth2' })).toBe('123456');
});

it('should return apiKey property for apiKey', () => {
  expect(getAuth(topLevelUser, { type: 'oauth2' })).toBe('123456');
});

it('should return user/pass properties for basic auth', () => {
  expect(getAuth(topLevelUser, { type: 'http', scheme: 'basic' })).toEqual({
    user: 'user',
    pass: 'pass',
  });
});

it('should return first item from keys array if no app selected', () => {
  expect(getAuth(keysUser, { type: 'oauth2' })).toBe('123456');
});

it('should return selected app from keys array if app provided', () => {
  expect(getAuth(keysUser, { type: 'oauth2' }, 'app-2')).toBe('7890');
});

it('should return item by scheme name if no apiKey/user/pass', () => {
  expect(getAuth(topLevelSchemeUser, { type: 'oauth2', _key: 'schemeName' })).toBe('scheme-key');
  expect(getAuth(keysSchemeUser, { type: 'oauth2', _key: 'schemeName' })).toBe('scheme-key-1');
  expect(getAuth(keysSchemeUser, { type: 'oauth2', _key: 'schemeName' }, 'app-2')).toBe(
    'scheme-key-2',
  );
  expect(getAuth(keysSchemeUser, { type: 'http', _key: 'schemeName' }, 'app-3')).toEqual({
    user: 'user',
    pass: 'pass',
  });
});

it('should return null for anything else', () => {
  expect(getAuth(topLevelUser, { type: 'unknown' })).toBe(null);
  expect(getAuth(keysUser, { type: 'unknown' })).toBe(null);
  expect(getAuth(keysUser, { type: 'unknown' }, 'app-2')).toBe(null);
});

it('should allow scheme to be undefined', () => {
  expect(getAuth(topLevelUser)).toBe(null);
});
