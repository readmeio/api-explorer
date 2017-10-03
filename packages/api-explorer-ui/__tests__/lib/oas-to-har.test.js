const oasToHar = require('../../src/lib/oas-to-har');

test('should output a har format', () => {
  expect(oasToHar({})).toEqual({
    log: {
      entries: [
        {
          request: {
            headers: [],
            method: '',
            postData: {},
            queryString: [],
            url: '',
          },
        },
      ],
    },
  });
});

test('should uppercase the method', () => {
  expect(oasToHar({}, { path: '/', method: 'get' }).log.entries[0].request.method).toBe('GET');
});

describe('url', () => {
  test('should default to ""', () => {
    expect(oasToHar({}, { path: '', method: '' }).log.entries[0].request.url).toBe('');
    expect(oasToHar({}, { path: '/path', method: '' }).log.entries[0].request.url).toBe('/path');
  });

  test('should be constructed from servers[0]', () => {
    expect(
      oasToHar(
        {
          servers: [{ url: 'http://example.com' }],
        },
        { path: '/path', method: 'get' },
      ).log.entries[0].request.url,
    ).toBe('http://example.com/path');
  });

  test('should replace whitespace with %20', () => {
    expect(
      oasToHar(
        {
          servers: [{ url: 'http://example.com' }],
        },
        { path: '/path with spaces', method: '' },
      ).log.entries[0].request.url,
    ).toBe('http://example.com/path%20with%20spaces');
  });

  test('should replace path params with values');
});

describe('path values', () => {
  test('should pass through unknown path params', () => {
    expect(oasToHar({}, { path: '/param-path/{id}', method: '' }).log.entries[0].request.url).toBe(
      '/param-path/id',
    );
    expect(
      oasToHar(
        {},
        {
          path: '/param-path/{id}',
          method: 'get',
          parameters: [
            {
              name: 'something-else',
              in: 'path',
              required: true,
            },
          ],
        },
      ).log.entries[0].request.url,
    ).toBe('/param-path/id');
  });

  test('should not error if empty object passed in for values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/param-path/{id}',
          method: 'get',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
            },
          ],
        },
        {},
      ).log.entries[0].request.url,
    ).toBe('/param-path/id');
  });

  test('should use example if no value', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/param-path/{id}',
          method: 'get',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              example: '123',
            },
          ],
        },
      ).log.entries[0].request.url,
    ).toBe('/param-path/123');
  });

  test('should add path values to the url', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/param-path/{id}',
          method: 'get',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
            },
          ],
        },
        { path: { id: '456' } },
      ).log.entries[0].request.url,
    ).toBe('/param-path/456');
  });
});

describe('query values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/query',
          method: 'get',
          parameters: [
            {
              name: 'a',
              in: 'query',
            },
          ],
        },
      ).log.entries[0].request.queryString,
    ).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/query',
          method: 'get',
          parameters: [
            {
              name: 'a',
              in: 'query',
              required: true,
              example: 'value',
            },
          ],
        },
      ).log.entries[0].request.queryString,
    ).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/query',
          method: 'get',
          parameters: [
            {
              name: 'a',
              in: 'query',
              required: true,
              example: 'value',
            },
          ],
        },
        { query: { a: 'test' } },
      ).log.entries[0].request.queryString,
    ).toEqual([{ name: 'a', value: 'test' }]);
  });
});

describe('header values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/header',
          method: 'get',
          parameters: [
            {
              name: 'a',
              in: 'header',
            },
          ],
        },
      ).log.entries[0].request.headers,
    ).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/header',
          method: 'get',
          parameters: [
            {
              name: 'a',
              in: 'header',
              required: true,
              example: 'value',
            },
          ],
        },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'a', value: 'value' }, { name: 'Content-Type', value: 'application/json' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/header',
          method: 'get',
          parameters: [
            {
              name: 'a',
              in: 'header',
              required: true,
              example: 'value',
            },
          ],
        },
        { header: { a: 'test' } },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'a', value: 'test' }, { name: 'Content-Type', value: 'application/json' }]);
  });
});

describe('body values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'get',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    a: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      ).log.entries[0].request.postData.text,
    ).toEqual(undefined);
  });

  // TODO extensions[SEND_DEFAULTS]
  it.skip('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'get',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['a'],
                  properties: {
                    a: {
                      type: 'string',
                    },
                  },
                },
                example: { a: 'value' },
              },
            },
          },
        },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 'value' }));
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'get',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['a'],
                  properties: {
                    a: {
                      type: 'string',
                    },
                  },
                },
                example: { a: 'value' },
              },
            },
          },
        },
        { body: { a: 'test' } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 'test' }));
  });
});

describe('form data values', () => {});

describe('auth', () => {
  test('should work for header', () => {
    expect(
      oasToHar(
        {
          components: {
            securitySchemes: {
              'auth-header': {
                type: 'apiKey',
                name: 'x-auth-header',
                in: 'header',
              },
            },
          },
        },
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [] }],
        },
        {
          auth: {
            'auth-header': 'value',
          },
        },
      ).log.entries[0].request.headers,
    ).toEqual([
      {
        name: 'Content-Type',
        value: 'application/json',
      },
      {
        name: 'x-auth-header',
        value: 'value',
      },
    ]);
  });

  test('should work for query', () => {
    expect(
      oasToHar(
        {
          components: {
            securitySchemes: {
              'auth-query': {
                type: 'apiKey',
                name: 'authQuery',
                in: 'query',
              },
            },
          },
        },
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-query': [] }],
        },
        {
          auth: {
            'auth-query': 'value',
          },
        },
      ).log.entries[0].request.queryString,
    ).toEqual([
      {
        name: 'authQuery',
        value: 'value',
      },
    ]);
  });

  test('should work for multiple');

  test('should not set non-existent values', () => {
    expect(
      oasToHar(
        {
          components: {
            securitySchemes: {
              'auth-header': {
                type: 'apiKey',
                name: 'x-auth-header',
                in: 'header',
              },
            },
          },
        },
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [] }],
        },
        { auth: {} },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });
});
