const isAuthReady = require('../../src/lib/is-auth-ready');
const Oas = require('../../src/lib/Oas.js');
const authTypesOas = require('../fixtures/auth-types/oas');

const oas = new Oas(authTypesOas);

describe('isAuthReady', () => {
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

    expect(isAuthReady(operation, { basic: { username: 'test', password: 'pass' } })).toBe(true);
  });

  it('should return false if auth data is not passed in for basic condition', () => {
    const operation = oas.operation('/basic', 'post');

    expect(isAuthReady(operation, { basic: { username: '', password: '' } })).toBe(false);
  });

  it('should return true if endpoint does not need auth or passed in auth is correct', () => {
    const operation = oas.operation('/no-auth', 'post');

    expect(isAuthReady(operation)).toBe(true);
  });
});
