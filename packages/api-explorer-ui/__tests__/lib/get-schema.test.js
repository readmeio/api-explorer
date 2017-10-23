const getSchema = require('../../src/lib/get-schema');
const Oas = require('../../src/lib/Oas.js');

const petstore = require('../fixtures/petstore/oas');

const oas = new Oas(petstore);

describe('getSchema', () => {
  it('should return schema if requestBody content is application json', () => {
    const operation = oas.operation('/user/{username}', 'put');

    expect(getSchema(operation)).toEqual({
      $ref: '#/components/schemas/User',
    });
  });

  it('should return requestBody if content is not application json', () => {
    const operation = oas.operation('/user/createWithList', 'post');

    expect(getSchema(operation)).toEqual({
      $ref: '#/components/requestBodies/UserArray',
    });
  });
});
