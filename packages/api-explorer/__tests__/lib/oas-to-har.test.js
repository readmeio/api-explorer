const querystring = require('querystring');

const extensions = require('@readme/oas-extensions');
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
            url: 'https://example.com',
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
  test('should default to "https://example.com"', () => {
    expect(oasToHar({}, { path: '', method: '' }).log.entries[0].request.url).toBe(
      'https://example.com',
    );
    expect(oasToHar({}, { path: '/path', method: '' }).log.entries[0].request.url).toBe(
      'https://example.com/path',
    );
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

  test('should add https:// if url starts with //', () => {
    expect(
      oasToHar(
        {
          servers: [{ url: '//example.com' }],
        },
        { path: '/', method: 'get' },
      ).log.entries[0].request.url,
    ).toBe('https://example.com/');
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

  describe('proxy url', () => {
    test('should not be prefixed with without option', () => {
      expect(
        oasToHar(
          {
            servers: [{ url: 'http://example.com' }],
            [extensions.PROXY_ENABLED]: true,
          },
          { path: '/path', method: 'get' },
        ).log.entries[0].request.url,
      ).toBe('http://example.com/path');
    });

    test('should be prefixed with try.readme.io with option', () => {
      expect(
        oasToHar(
          {
            servers: [{ url: 'http://example.com' }],
            [extensions.PROXY_ENABLED]: true,
          },
          { path: '/path', method: 'get' },
          {},
          { proxyUrl: true },
        ).log.entries[0].request.url,
      ).toBe('https://try.readme.io/http://example.com/path');
    });
  });
});

describe('path values', () => {
  test('should pass through unknown path params', () => {
    expect(oasToHar({}, { path: '/param-path/{id}', method: '' }).log.entries[0].request.url).toBe(
      'https://example.com/param-path/id',
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
    ).toBe('https://example.com/param-path/id');
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
    ).toBe('https://example.com/param-path/id');
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
    ).toBe('https://example.com/param-path/123');
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
    ).toBe('https://example.com/param-path/456');
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
    ).toEqual([{ name: 'a', value: 'value' }]);
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
    ).toEqual([{ name: 'a', value: 'test' }]);
  });

  it('should pass accept header if endpoint expects a content back from response', () => {
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
          responses: {
            200: {
              content: {
                'application/xml': {
                  type: 'array',
                },
                'application/json': {
                  type: 'array',
                },
              },
            },
          },
        },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'Accept', value: 'application/xml' }, { name: 'a', value: 'value' }]);
  });

  it('should only add one accept header', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/header',
          method: 'get',
          parameters: [],
          responses: {
            200: {
              content: {
                'application/xml': {},
              },
            },
            400: {
              content: {
                'application/json': {},
              },
            },
          },
        },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'Accept', value: 'application/xml' }]);
  });
});

const pathOperation = {
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
};

describe('body values', () => {
  it('should not add on empty unrequired values', () => {
    expect(oasToHar({}, pathOperation).log.entries[0].request.postData.text).toEqual(undefined);
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
              },
            },
          },
        },
        { body: { a: 'test' } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 'test' }));
  });

  it('should work for RAW_BODY primitives', () => {
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
                    RAW_BODY: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        { body: { RAW_BODY: 'test' } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify('test'));
  });

  it('should work for RAW_BODY json', () => {
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
                    RAW_BODY: {
                      type: 'string',
                      format: 'json',
                    },
                  },
                },
              },
            },
          },
        },
        { body: { RAW_BODY: '{ "a": 1 }' } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 1 }));
  });

  it('should return empty for falsy RAW_BODY primitives', () => {
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
                    RAW_BODY: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        { body: { RAW_BODY: '' } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify(''));
  });

  it('should work for RAW_BODY objects', () => {
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
                    RAW_BODY: {
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
          },
        },
        { body: { RAW_BODY: { a: 'test' } } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 'test' }));
  });

  it('should return empty for RAW_BODY objects', () => {
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
                    RAW_BODY: {
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
          },
        },
        { body: { RAW_BODY: {} } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({}));
  });

  it('should return nothing for undefined body property', () => {
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
        { body: { a: undefined } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({}));
  });

  it('should work for schemas that require a lookup', () => {
    expect(
      oasToHar(
        {
          components: {
            requestBodies: {
              schema: {
                content: {
                  'application/json': {
                    schema: { type: 'object', properties: { a: { type: 'integer' } } },
                  },
                },
              },
            },
          },
        },
        {
          path: '/body',
          method: 'get',
          requestBody: {
            $ref: '#/components/requestBodies/schema',
          },
        },
        { body: { a: 123 } },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 123 }));
  });

  it('should work for top level primitives', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'post',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
        { body: 'string' },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify('string'));

    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'post',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'integer',
                  format: 'int64',
                },
              },
            },
          },
        },
        { body: 123 },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify(123));

    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'post',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'boolean',
                },
              },
            },
          },
        },
        { body: true },
      ).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify(true));
  });

  describe('`json` type', () => {
    it('should work for refs that require a lookup', () => {
      expect(
        oasToHar(
          {
            components: {
              requestBodies: {
                schema: {
                  content: {
                    'application/json': {
                      schema: {
                        string: 'object',
                        properties: { a: { type: 'string', format: 'json' } },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            path: '/body',
            method: 'get',
            requestBody: {
              $ref: '#/components/requestBodies/schema',
            },
          },
          { body: { a: '{ "b": 1 }' } },
        ).log.entries[0].request.postData.text,
      ).toEqual(JSON.stringify({ a: JSON.parse('{ "b": 1 }') }));
    });

    it('should leave invalid JSON as strings', () => {
      expect(
        oasToHar(
          {},
          {
            path: '/body',
            method: 'post',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['a'],
                    properties: {
                      a: {
                        type: 'string',
                        format: 'json',
                      },
                    },
                  },
                },
              },
            },
          },
          { body: { a: '{ "b": invalid json' } },
        ).log.entries[0].request.postData.text,
      ).toEqual(JSON.stringify({ a: '{ "b": invalid json' }));
    });

    it('should parse valid JSON as an object', () => {
      expect(
        oasToHar(
          {},
          {
            path: '/body',
            method: 'post',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['a'],
                    properties: {
                      a: {
                        type: 'string',
                        format: 'json',
                      },
                    },
                  },
                },
              },
            },
          },
          { body: { a: '{ "b": "valid json" }' } },
        ).log.entries[0].request.postData.text,
      ).toEqual(JSON.stringify({ a: JSON.parse('{ "b": "valid json" }') }));
    });
  });
});

describe('formData values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'get',
          requestBody: {
            content: {
              'application/x-www-form-urlencoded': {
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
              'application/x-www-form-urlencoded': {
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
    ).toEqual(querystring.stringify({ a: 'value' }));
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
              'application/x-www-form-urlencoded': {
                schema: {
                  type: 'object',
                  required: ['a'],
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
        { formData: { a: 'test', b: [1, 2, 3] } },
      ).log.entries[0].request.postData.text,
    ).toEqual(querystring.stringify({ a: 'test', b: [1, 2, 3] }));
  });
});

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

  test('should work for multiple (||)', () => {
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
              'auth-header2': {
                type: 'apiKey',
                name: 'x-auth-header2',
                in: 'header',
              },
            },
          },
        },
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [] }, { 'auth-header2': [] }],
        },
        {
          auth: {
            'auth-header': 'value',
            'auth-header2': 'value',
          },
        },
      ).log.entries[0].request.headers,
    ).toEqual([
      {
        name: 'x-auth-header',
        value: 'value',
      },
      {
        name: 'x-auth-header2',
        value: 'value',
      },
    ]);
  });

  test('should work for multiple (&&)', () => {
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
              'auth-header2': {
                type: 'apiKey',
                name: 'x-auth-header2',
                in: 'header',
              },
            },
          },
        },
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [], 'auth-header2': [] }],
        },
        {
          auth: {
            'auth-header': 'value',
            'auth-header2': 'value',
          },
        },
      ).log.entries[0].request.headers,
    ).toEqual([
      {
        name: 'x-auth-header',
        value: 'value',
      },
      {
        name: 'x-auth-header2',
        value: 'value',
      },
    ]);
  });

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
    ).toEqual([]);
  });
});

describe('content-type & accept header', () => {
  const operation = {
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
  };

  it('should be sent through if there are no body values but there is a requestBody', () => {
    expect(oasToHar({}, operation, {}).log.entries[0].request.headers).toEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
    expect(oasToHar({}, operation, { query: { a: 1 } }).log.entries[0].request.headers).toEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
  });

  it('should be sent through if there are any body values', () => {
    expect(
      oasToHar({}, operation, { body: { a: 'test' } }).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should be sent through if there are any formData values', () => {
    expect(
      oasToHar({}, operation, { formData: { a: 'test' } }).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should fetch the type from the first `requestBody.content` and first `responseBody.content` object', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'get',
          requestBody: {
            content: {
              'text/xml': {
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
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'text/xml' }]);
  });

  // Whether this is right or wrong, i'm not sure but this is what readme currently does
  it('should prioritise json if it exists', () => {
    expect(
      oasToHar(
        {},
        {
          path: '/body',
          method: 'get',
          requestBody: {
            content: {
              'text/xml': {
                schema: {
                  type: 'string',
                  required: ['a'],
                  properties: {
                    a: {
                      type: 'string',
                    },
                  },
                },
                example: { a: 'value' },
              },
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
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });
});
