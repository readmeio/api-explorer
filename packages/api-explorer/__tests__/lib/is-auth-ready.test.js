const Oas = require('oas/tooling');

const isAuthReady = require('../../src/lib/is-auth-ready');
const authTypesOas = require('../__fixtures__/auth-types/oas.json');
const multipleSchemes = require('../__fixtures__/multiple-securities/oas.json');
const noSecuritySchemes = require('../__fixtures__/auth-types/no-security-schemes.json');

const oas = new Oas(authTypesOas);
const oas2 = new Oas(multipleSchemes);

describe('isAuthReady', () => {
  it('should return true if a security type is defined, but no securitySchemes are present', () => {
    const operation = new Oas(noSecuritySchemes).operation('/oauth', 'post');

    expect(
      isAuthReady(operation, {
        oauth: 'bearer',
      })
    ).toBe(true);
  });

  it('should return true if multiple security types required (&&)', () => {
    const operation = oas2.operation('/and-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: 'bearer',
        apiKeyScheme: 'bearer',
        basicAuth: { user: 'test', password: 'pass' },
      })
    ).toBe(true);
  });

  it('should return false if multiple security types required (&&) and one missing', () => {
    const operation = oas2.operation('/and-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        apiKeyScheme: 'bearer',
      })
    ).toBe(false);
  });

  it('should return false if multiple security types required (&&) and both missing', () => {
    const operation = oas2.operation('/and-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        apiKeyScheme: '',
      })
    ).toBe(false);
  });

  it('should return true if one of multiple security types required (||)', () => {
    const operation = oas2.operation('/or-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: 'bearer',
        apiKeyScheme: '',
      })
    ).toBe(true);

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        apiKeyScheme: 'bearer',
      })
    ).toBe(true);
  });

  it('should return false if both of multiple security types required is missing (||)', () => {
    const operation = oas2.operation('/or-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        oauthDiff: '',
      })
    ).toBe(false);
  });

  it('should return false if both security types required are missing (&& ||)', () => {
    const operation = oas2.operation('/and-or-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: 'bearer',
        apiKeyScheme: '',
        oauthDiff: '',
      })
    ).toBe(false);

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        apiKeyScheme: 'key',
        oauthDiff: '',
      })
    ).toBe(false);

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        apiKeyScheme: '',
        oauthDiff: '',
      })
    ).toBe(false);
  });

  it('should return true if one security types required (&& ||)', () => {
    const operation = oas2.operation('/and-or-security', 'post');

    expect(
      isAuthReady(operation, {
        oauthScheme: 'bearer',
        apiKeyScheme: '',
        oauthDiff: 'test',
      })
    ).toBe(true);

    expect(
      isAuthReady(operation, {
        oauthScheme: '',
        apiKeyScheme: '',
        oauthDiff: 'test',
      })
    ).toBe(true);

    expect(
      isAuthReady(operation, {
        oauthScheme: 'bearer',
        apiKeyScheme: 'key',
        oauthDiff: '',
      })
    ).toBe(true);
  });

  it('should return true if auth data is passed in correctly for api key condition', () => {
    const operation = oas.operation('/api-key', 'post');

    expect(isAuthReady(operation, { apiKey: 'test' })).toBe(true);
  });

  it('should return false if auth data is not passed in for api key condition', () => {
    const operation = oas.operation('/api-key', 'post');

    expect(isAuthReady(operation, { apiKey: '' })).toBe(false);
  });

  it('should return false if auth data is not passed in correctly for oauth condition', () => {
    const operation = oas.operation('/oauth', 'post');

    expect(isAuthReady(operation, { oauth: '' })).toBe(false);
  });

  it('should return true if auth data is passed in correctly for oauth condition', () => {
    const operation = oas.operation('/oauth', 'post');

    expect(isAuthReady(operation, { oauth: 'bearer' })).toBe(true);
  });

  it('should return true if auth data is passed in for basic condition', () => {
    const operation = oas.operation('/basic', 'post');

    expect(isAuthReady(operation, { basic: { user: 'test', password: 'pass' } })).toBe(true);
  });

  it('should return false if auth data is not passed in for basic condition', () => {
    const operation = oas.operation('/basic', 'post');

    expect(isAuthReady(operation, { basic: { user: '', password: '' } })).toBe(false);
  });

  it('should return true if auth data is passed in for bearer condition', () => {
    const operation = oas.operation('/bearer', 'post');

    expect(isAuthReady(operation, { bearer: 'bearer' })).toBe(true);
  });

  it('should return false if auth data is not passed in for bearer condition', () => {
    const operation = oas.operation('/bearer', 'post');

    expect(isAuthReady(operation, { bearer: '' })).toBe(false);
  });

  it('should return true if endpoint does not need auth or passed in auth is correct', () => {
    const operation = oas.operation('/no-auth', 'post');

    expect(isAuthReady(operation)).toBe(true);
  });

  it('should return false if scheme type is unknown', () => {
    const operation = oas2.operation('/unknown-auth-type', 'post');

    expect(isAuthReady(operation)).toBe(false);
  });

  it('should return false if auth scheme does not exist', () => {
    const operation = oas2.operation('/unknown-scheme', 'post');

    expect(isAuthReady(operation)).toBe(false);
  });
});
