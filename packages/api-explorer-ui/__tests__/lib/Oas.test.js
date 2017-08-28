const Oas = require('../../src/lib/Oas');
const petstore = require('../fixtures/petstore/oas.json');
const multipleSecurities = require('../fixtures/multiple-securities/oas.json');

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

// https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securitySchemeObject
describe('prepareSecurity()', () => {
  const path = '/auth';
  const method = 'get';

  function createSecurityOas(schemes) {
    // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md#securityRequirementObject
    const security = Object.keys(schemes).map((scheme) => {
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

    expect(oas.prepareSecurity(path, method)).toEqual({
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

    expect(oas.prepareSecurity(path, method)).toEqual({
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

    expect(oas.prepareSecurity(path, method)).toEqual({
      Header: [oas.components.securitySchemes.securityScheme],
    });
  });

  test('should work for petstore', () => {
    const oas = new Oas(petstore);

    expect(oas.prepareSecurity('/pet', 'post')).toMatchSnapshot();
  });

  test('should work for multiple securities', () => {
    const oas = new Oas(multipleSecurities);

    expect(Object.keys(oas.prepareSecurity('/things', 'post')).length).toBe(2);
  });

  test('should set a `key` property');

  // TODO We dont currently support cookies?
  test('apiKey/cookie: should return with a type of Cookie');

  test('should throw if attempting to use a non-existent scheme');
});
