const Oas = require('../../src/lib/Oas');

describe('hasAuth()', () => {
  test('should return true if there is a top level security object', () => {
    expect(new Oas({ security: [{ 'security-scheme': [] }] }).hasAuth()).toBe(true);
    expect(new Oas({ security: [{ 'security-scheme': ['scope'] }] }).hasAuth()).toBe(true);
  });

  test('should return true if a path has security', () => {
    expect(new Oas({
      paths: {
        '/path': {
          get: {
            security: [{ 'security-scheme': [] }],
          },
        },
      },
    }).hasAuth('/path', 'get')).toBe(true);
  });

  test('should return false if there is no top level security object', () => {
    expect(new Oas({}).hasAuth()).toBe(false);
    expect(new Oas({ security: [] }).hasAuth()).toBe(false);
  });

  test('should return false if the path has no security', () => {
    expect(new Oas({
      paths: {
        '/path': {
          get: {},
        },
      },
    }).hasAuth('/path', 'get')).toBe(false);
  });
});

describe('getPathOperation()', () => {
  test('should return a stub if there is no operation', () => {
    expect(new Oas({}).getPathOperation({
      swagger: { path: '/path' },
      api: { method: 'get' },
    })).toEqual({ parameters: [] });
  });

  test('should return the operation if there is one', () => {
    const operation = { a: 1 };
    expect(new Oas({
      paths: {
        '/path': {
          get: operation,
        },
      },
    }).getPathOperation({ swagger: { path: '/path' }, api: { method: 'get' } })).toBe(operation);
  });
});

test('should be able to access properties on oas', () => {
  expect(new Oas({
    info: { version: '1.0' },
  }).info.version).toBe('1.0');
});
