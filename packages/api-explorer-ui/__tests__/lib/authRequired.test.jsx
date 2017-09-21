const isAuthReady = require('../../src/lib/auth-required');
const Oas = require('../../src/lib/Oas.js');
const petstore = require('../fixtures/petstore/oas');
const auth = require('../fixtures/auth-types/oas');

const oas = new Oas(petstore);
const oas2 = new Oas(auth);

describe('isAuthReady', () => {
  it('should return true if auth data is passed in correctly for api key condition', () => {
    const operation = oas.operation('/pet/{petId}', 'get');

    expect(isAuthReady(operation, { api_key: 'test' })).toBe(true);
  });

  it('should return false if auth data is not passed in for api key condition', () => {
    const operation = oas.operation('/pet/{petId}', 'get');

    expect(isAuthReady(operation, { api_key: '' })).toBe(false);
  });

  it('should return false if auth data is not passed in correctly for oauth condition', () => {
    const operation = oas.operation('/pet/{petId}', 'delete');

    expect(isAuthReady(operation, { petstore_auth: '' })).toBe(false);
  });

  it('should return true if auth data is passed in correctly for oauth condition', () => {
    const operation = oas.operation('/pet/{petId}', 'delete');

    expect(isAuthReady(operation, { petstore_auth: 'ouath' })).toBe(true);
  });

  it('should return true if auth data is passed in for basic condition', () => {
    const operation = oas2.operation('/basic', 'post');

    expect(isAuthReady(operation, { basic: { username: 'test', password: 'pass' } })).toBe(true);
  });

  it('should return false if auth data is not passed in for basic condition', () => {
    const operation = oas2.operation('/basic', 'post');

    expect(isAuthReady(operation, { basic: { username: '', password: '' } })).toBe(false);
  });

  it('should return true if endpoint does not need auth or passed in auth is correct', () => {
    const operation = oas.operation('/store/order/{orderId}', 'get');

    expect(isAuthReady(operation)).toBe(true);
  });
});
