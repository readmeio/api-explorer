const Oas = require('../../src/lib/Oas');
const { Operation } = require('../../src/lib/Oas');
const petstore = require('../fixtures/petstore/oas.json');
const multipleSecurities = require('../fixtures/multiple-securities/oas.json');

describe('operation()', () => {
  test('should return an operation object', () => {
    const oas = { paths: { '/path': { get: { a: 1 } } } };
    const operation = new Oas(oas).operation('/path', 'get');
    expect(operation).toBeInstanceOf(Operation);
    expect(operation.a).toBe(1);
    expect(operation.path).toBe('/path');
    expect(operation.method).toBe('get');
  });

  test('should return a default when no operation', () => {
    expect(new Oas({}).operation('/unknown', 'get')).toMatchSnapshot();
  });
});


test('should remove end slash from the server URL', () => {
  expect(new Oas({ servers: [{ url: 'http://example.com/' }] }).servers[0].url).toBe(
    'http://example.com',
  );
});

describe('operation.getSecurity()', () => {
  const security = [{ auth: [] }];

  test('should return the security on this endpoint', () => {
    expect(
      new Oas({
        info: { version: '1.0' },
        paths: {
          '/things': {
            post: {
              security,
            },
          },
        },
      })
        .operation('/things', 'post')
        .getSecurity(),
    ).toBe(security);
  });

  test('should fallback to global security', () => {
    expect(
      new Oas({
        info: { version: '1.0' },
        paths: {
          '/things': {
            post: {},
          },
        },
        security,
      })
        .operation('/things', 'post')
        .getSecurity(),
    ).toBe(security);
  });

  test('should default to empty array', () => {
    expect(
      new Oas({
        info: { version: '1.0' },
        paths: {
          '/things': {
            post: {},
          },
        },
      })
        .operation('/things', 'post')
        .getSecurity(),
    ).toEqual([]);
  });
});

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securitySchemeObject
describe('operation.prepareSecurity()', () => {
  const path = '/auth';
  const method = 'get';

  function createSecurityOas(schemes) {
    // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securityRequirementObject
    const security = Object.keys(schemes).map(scheme => {
      return { [scheme]: [] };
    });

    return new Oas({
      components: { securitySchemes: schemes },
      paths: {
        [path]: {
          [method]: { security },
        },
      },
    });
  }

  test('http: should return with a type of Basic', () => {
    const oas = createSecurityOas({
      securityScheme: {
        type: 'http',
        scheme: 'basic',
      },
    });
    const operation = oas.operation(path, method);

    expect(operation.prepareSecurity()).toEqual({
      Basic: [oas.components.securitySchemes.securityScheme],
    });
  });

  test('apiKey/query: should return with a type of Query', () => {
    const oas = createSecurityOas({
      securityScheme: {
        type: 'apiKey',
        in: 'query',
      },
    });
    const operation = oas.operation(path, method);

    expect(operation.prepareSecurity()).toEqual({
      Query: [oas.components.securitySchemes.securityScheme],
    });
  });

  test('apiKey/header: should return with a type of Header', () => {
    const oas = createSecurityOas({
      securityScheme: {
        type: 'apiKey',
        in: 'header',
      },
    });
    const operation = oas.operation(path, method);

    expect(operation.prepareSecurity()).toEqual({
      Header: [oas.components.securitySchemes.securityScheme],
    });
  });

  test('should work for petstore', () => {
    const operation = new Oas(petstore).operation('/pet', 'post');

    expect(operation.prepareSecurity()).toMatchSnapshot();
  });

  test('should work for multiple securities (||)', () => {
    const operation = new Oas(multipleSecurities).operation('/things', 'post');

    expect(Object.keys(operation.prepareSecurity()).length).toBe(2);
  });

  test('should work for multiple securities (&&)', () => {
    const operation = new Oas(multipleSecurities).operation('/and-security', 'post');

    expect(Object.keys(operation.prepareSecurity()).length).toBe(2);
  });

  test('should work for multiple securities (&& and ||)', () => {
    const operation = new Oas(multipleSecurities).operation('/and-or-security', 'post');

    expect(operation.prepareSecurity().OAuth2.length).toBe(2);
    expect(operation.prepareSecurity().Header.length).toBe(1);
  });

  test('should set a `key` property');

  // TODO We dont currently support cookies?
  test('apiKey/cookie: should return with a type of Cookie');

  test('should throw if attempting to use a non-existent scheme');

  test('should return null if no security', () => {
    const operation = new Oas(multipleSecurities).operation('/no-auth', 'post');
    expect(operation.prepareSecurity()).toBe(null);
  });

  test('should return null if security scheme doesnt exist', () => {
    const operation = new Oas(multipleSecurities).operation('/unknown-scheme', 'post');
    expect(operation.prepareSecurity()).toBe(null);
  });

  test('should return null if security scheme type doesnt exist', () => {
    const operation = new Oas(multipleSecurities).operation('/unknown-auth-type', 'post');
    expect(operation.prepareSecurity()).toBe(null);
  });
});
