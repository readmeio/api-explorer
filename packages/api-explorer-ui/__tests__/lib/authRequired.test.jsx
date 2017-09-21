const AuthRequired = require('../../src/lib/authRequired');
const Oas = require('../../src/lib/Oas.js');
const petstore = require('../fixtures/petstore/oas');
const auth = require('../fixtures/auth-types/oas');

const oas = new Oas(petstore);
const oas2 = new Oas(auth);

describe('AuthRequired', () => {
  xit('should return false if auth data is not passed in for api key condition', () => {
    const operation = oas.operation('/pet/{petId}', 'patch');

    expect(AuthRequired(operation)).toBe(null);
  });
  it('should return false if auth data is not passed in for api key condition', () => {
    const operation = oas.operation('/pet/{petId}', 'get');

    expect(AuthRequired(operation, { api_key: '' })).toBe(false);
  });

  it('should return false if auth data is not passed in for oaut condition', () => {
    const operation = oas.operation('/pet/{petId}', 'delete');

    expect(AuthRequired(operation, { petstore_auth: '' })).toBe(false);
  });

  it('should return false if auth data is not passed in for basic condition', () => {
    const operation = oas2.operation('/basic', 'post');

    expect(AuthRequired(operation, { basic: { username: '', password: '' } })).toBe(false);
  });

  it('should return true if endpoint does not need auth or passed in auth is correct', () => {
    const operation = oas.operation('/store/order/{orderId}', 'get');

    expect(AuthRequired(operation)).toBe(true);
  });
});
