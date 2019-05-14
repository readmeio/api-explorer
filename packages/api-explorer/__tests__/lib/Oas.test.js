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

  test('should strip trailing slashes from path', () => {
    const oas = { paths: { '/path/': { get: { a: 1 } } } };
    const operation = new Oas(oas).operation('/path/', 'get');
    expect(operation).toBeInstanceOf(Operation);
    expect(operation.path).toBe('/path');
  });

  test('should return a default when no operation', () => {
    expect(new Oas({}).operation('/unknown', 'get')).toMatchSnapshot();
  });

  test('should not strip trailing slashes from path if provided with boolean', () => {
    const oas = { paths: { '/path/': { get: { a: 1 } } } };
    const operation = new Oas(oas).operation('/path/', 'get', false);
    expect(operation).toBeInstanceOf(Operation);
    expect(operation.path).toBe('/path/');
  });
});

test('should remove end slash from the server URL', () => {
  expect(new Oas({ servers: [{ url: 'http://example.com/' }] }).url()).toBe('http://example.com');
});

test('should default missing servers array to example.com', () => {
  expect(new Oas({}).url()).toBe('https://example.com');
});

test('should default empty servers array to example.com', () => {
  expect(new Oas({ servers: [] }).url()).toBe('https://example.com');
});

test('should default empty server object to example.com', () => {
  expect(new Oas({ servers: [{}] }).url()).toBe('https://example.com');
});

test('should add https:// if url starts with //', () => {
  expect(new Oas({ servers: [{ url: '//example.com' }] }).url()).toBe('https://example.com');
});

test('should add https:// if url does not start with a protocol', () => {
  expect(new Oas({ servers: [{ url: 'example.com' }] }).url()).toBe('https://example.com');
});

describe('server variables', () => {
  it('should use defaults', () => {
    expect(
      new Oas({
        servers: [{ url: 'https://example.com/{path}', variables: { path: { default: 'path' } } }],
      }).url(),
    ).toBe('https://example.com/path');
  });

  it('should use user variables over defaults', () => {
    expect(
      new Oas(
        {
          servers: [
            { url: 'https://{username}.example.com', variables: { username: { default: 'demo' } } },
          ],
        },
        { username: 'domh' },
      ).url(),
    ).toBe('https://domh.example.com');
  });

  it('should fetch user variables from keys array', () => {
    expect(
      new Oas(
        {
          servers: [
            { url: 'https://{username}.example.com', variables: { username: { default: 'demo' } } },
          ],
        },
        { keys: [{ name: 1, username: 'domh' }] },
      ).url(),
    ).toBe('https://domh.example.com');
  });

  it.skip('should fetch user variables from selected app', () => {
    expect(
      new Oas(
        {
          servers: [
            { url: 'https://{username}.example.com', variables: { username: { default: 'demo' } } },
          ],
        },
        { keys: [{ name: 1, username: 'domh' }, { name: 2, username: 'readme' }] },
        2,
      ).url(),
    ).toBe('https://readme.example.com');
  });

  // Test encodeURI
  it('should pass through if no default set', () => {
    expect(new Oas({ servers: [{ url: 'https://example.com/{path}' }] }).url()).toBe(
      'https://example.com/{path}',
    );
  });
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

test('should be able to access properties on oas', () => {
  expect(
    new Oas({
      info: { version: '1.0' },
    }).info.version,
  ).toBe('1.0');
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

  test('http/basic: should return with a type of Basic', () => {
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

  test('http/bearer: should return with a type of Bearer', () => {
    const oas = createSecurityOas({
      securityScheme: {
        type: 'http',
        scheme: 'bearer',
      },
    });
    const operation = oas.operation(path, method);

    expect(operation.prepareSecurity()).toEqual({
      Bearer: [oas.components.securitySchemes.securityScheme],
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
    const operation = new Oas(multipleSecurities).operation('/or-security', 'post');

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

  test.skip('should set a `key` property', () => {});

  // TODO We dont currently support cookies?
  test.skip('apiKey/cookie: should return with a type of Cookie', () => {});

  test.skip('should throw if attempting to use a non-existent scheme', () => {});

  test('should return empty object if no security', () => {
    const operation = new Oas(multipleSecurities).operation('/no-auth', 'post');
    expect(Object.keys(operation.prepareSecurity()).length).toBe(0);
  });

  test('should return empty object if security scheme doesnt exist', () => {
    const operation = new Oas(multipleSecurities).operation('/unknown-scheme', 'post');
    expect(Object.keys(operation.prepareSecurity()).length).toBe(0);
  });

  test('should return empty if security scheme type doesnt exist', () => {
    const operation = new Oas(multipleSecurities).operation('/unknown-auth-type', 'post');
    expect(Object.keys(operation.prepareSecurity()).length).toBe(0);
  });
});

describe('Operation', () => {
  it('should strip slash by default', () => {
    const oas = { paths: { '/path/': { get: { a: 1 } } } };
    const operation = new Operation(oas, '/path/', 'get', oas);
    expect(operation).toBeInstanceOf(Operation);
    expect(operation.path).toBe('/path');
    expect(operation.method).toBe('get');
  })

  it('should not strip slash if provided argument is false', () => {
    const oas = { paths: { '/path/': { get: { a: 1 } } } };
    const operation = new Operation(oas, '/path/', 'get', oas, false);
    expect(operation).toBeInstanceOf(Operation);
    expect(operation.path).toBe('/path/');
    expect(operation.method).toBe('get');
  })
})
