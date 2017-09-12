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

describe('operation.hasAuth()', () => {
  test('should return true if there is a top level security object', () => {
    expect(new Oas({ security: [{ 'security-scheme': [] }] }).operation().hasAuth()).toBe(true);
    expect(new Oas({ security: [{ 'security-scheme': ['scope'] }] }).operation().hasAuth()).toBe(
      true,
    );
  });

  test('should return true if a path has security', () => {
    expect(
      new Oas({
        paths: {
          '/path': {
            get: {
              security: [{ 'security-scheme': [] }],
            },
          },
        },
      })
        .operation('/path', 'get')
        .hasAuth(),
    ).toBe(true);
  });

  test('should return false if there is no top level security object', () => {
    expect(new Oas({}).operation().hasAuth()).toBe(false);
    expect(new Oas({ security: [] }).operation().hasAuth()).toBe(false);
  });

  test('should return false if the path has no security', () => {
    expect(
      new Oas({
        paths: {
          '/path': {
            get: {},
          },
        },
      })
        .operation('/path', 'get')
        .hasAuth(),
    ).toBe(false);
  });
});

test('should be able to access properties on oas', () => {
  expect(
    new Oas({
      info: { version: '1.0' },
    }).info.version,
  ).toBe('1.0');
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

  test('should work for multiple securities', () => {
    const operation = new Oas(multipleSecurities).operation('/things', 'post');

    expect(Object.keys(operation.prepareSecurity()).length).toBe(2);
  });

  test('should set a `key` property');

  // TODO We dont currently support cookies?
  test('apiKey/cookie: should return with a type of Cookie');

  test('should throw if attempting to use a non-existent scheme');
});
