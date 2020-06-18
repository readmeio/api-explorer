const querystring = require('querystring');

const extensions = require('@mia-platform/oas-extensions');
const oasToHar = require('../../src/lib/oas-to-har');

const Oas = require('../../src/lib/Oas');

const oas = new Oas();

test('should output a har format', () => {
  expect(oasToHar(oas)).toEqual({
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
  expect(oasToHar(oas, { path: '/', method: 'get' }).log.entries[0].request.method).toBe('GET');
});

describe('url', () => {
  test('should be constructed from oas.url()', () => {
    expect(oasToHar(oas, { path: '', method: 'get' }).log.entries[0].request.url).toBe(oas.url());
  });

  // TODO this should probably happen within the Operation class
  test('should replace whitespace with %20', () => {
    expect(
      oasToHar(oas, { path: '/path with spaces', method: '' }).log.entries[0].request.url,
    ).toBe('https://example.com/path%20with%20spaces');
  });

  describe('proxy url', () => {
    const proxyOas = new Oas({
      [extensions.PROXY_ENABLED]: false,
    });
    test('should not be prefixed with without option', () => {
      expect(oasToHar(proxyOas, { path: '/path', method: 'get' }).log.entries[0].request.url).toBe(
        'https://example.com/path',
      );
    });

    test('should never be prefixed with try.readme.io with option', () => {
      expect(
        oasToHar(proxyOas, { path: '/path', method: 'get' }, {}, {}, { proxyUrl: true }).log
          .entries[0].request.url,
      ).toBe('https://example.com/path');
    });
  });
});

describe('path values', () => {
  test('should pass through unknown path params', () => {
    expect(oasToHar(oas, { path: '/param-path/{id}', method: '' }).log.entries[0].request.url).toBe(
      'https://example.com/param-path/id',
    );
    expect(
      oasToHar(oas, {
        path: '/param-path/{id}',
        method: 'get',
        parameters: [
          {
            name: 'something-else',
            in: 'path',
            required: true,
          },
        ],
      }).log.entries[0].request.url,
    ).toBe('https://example.com/param-path/id');
  });

  test('should not error if empty object passed in for values', () => {
    expect(
      oasToHar(
        oas,
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
      oasToHar(oas, {
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
      }).log.entries[0].request.url,
    ).toBe('https://example.com/param-path/123');
  });

  test('should add path values to the url', () => {
    expect(
      oasToHar(
        oas,
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

  test('should add falsy values to the url', () => {
    expect(
      oasToHar(
        oas,
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
        { path: { id: 0 } },
      ).log.entries[0].request.url,
    ).toBe('https://example.com/param-path/0');
  });
});

describe('query values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(oas, {
        path: '/query',
        method: 'get',
        parameters: [
          {
            name: 'a',
            in: 'query',
          },
        ],
      }).log.entries[0].request.queryString,
    ).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(oas, {
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
      }).log.entries[0].request.queryString,
    ).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        oas,
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

  test('should add falsy values to the querystring', () => {
    expect(
      oasToHar(
        oas,
        {
          path: '/param-path',
          method: 'get',
          parameters: [
            {
              name: 'id',
              in: 'query',
            },
          ],
        },
        { query: { id: 0 } },
      ).log.entries[0].request.queryString,
    ).toEqual([{ name: 'id', value: '0' }]);
  });
});

describe('header values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(oas, {
        path: '/header',
        method: 'get',
        parameters: [
          {
            name: 'a',
            in: 'header',
          },
        ],
      }).log.entries[0].request.headers,
    ).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(oas, {
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
      }).log.entries[0].request.headers,
    ).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        oas,
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
      oasToHar(oas, {
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
      }).log.entries[0].request.headers,
    ).toEqual([{ name: 'Accept', value: 'application/xml' }, { name: 'a', value: 'value' }]);
  });

  it('should only add one accept header', () => {
    expect(
      oasToHar(oas, {
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
      }).log.entries[0].request.headers,
    ).toEqual([{ name: 'Accept', value: 'application/xml' }]);
  });

  it('should only receive one accept header if specified in values', () => {
    expect(
      oasToHar(
        oas,
        {
          path: '/header',
          method: 'get',
          parameters: [
            {
              name: 'Accept',
              in: 'header',
            },
          ],
          responses: {
            200: {
              content: {
                'application/json': {},
                'application/xml': {},
              },
            },
          },
        },
        { header: { Accept: 'application/xml' } },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'Accept', value: 'application/xml' }]);
  });

  test('should add falsy values to the headers', () => {
    expect(
      oasToHar(
        oas,
        {
          path: '/param-path',
          method: 'get',
          parameters: [
            {
              name: 'id',
              in: 'header',
            },
          ],
        },
        { header: { id: 0 } },
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'id', value: '0' }]);
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
    expect(oasToHar(oas, pathOperation).log.entries[0].request.postData.text).toEqual(undefined);
  });
  test('should not crash if some values is not a base64 data', () => {
    const values = {
      "path": {
        "petId": 0
      },
      "formData": {
        "other": "gigi",
        "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAAk3WerNoR4AAAAASUVORK5CYII="
      }
    }
    oasToHar(oas, pathOperation, values, {}, {}, 'multipart/form-data')
  })

  // TODO extensions[SEND_DEFAULTS]
  it.skip('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(oas, {
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
      }).log.entries[0].request.postData.text,
    ).toEqual(JSON.stringify({ a: 'value' }));
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        oas,
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
        oas,
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
        oas,
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
        oas,
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
        oas,
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
        oas,
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
    ).toEqual(undefined);
  });

  it('should return nothing for undefined body property', () => {
    expect(
      oasToHar(
        oas,
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
    ).toEqual(undefined);
  });

  it('should work for schemas that require a lookup', () => {
    expect(
      oasToHar(
        new Oas({
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
        }),
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

  it('should work for schemas that require a parameters lookup', () => {
    expect(
      oasToHar(
        new Oas({
          components: {
            parameters: {
              authorization: {
                name: 'Authorization',
                in: 'header',
              },
            },
          },
        }),
        {
          method: 'get',
          parameters: [
            {
              $ref: '#/components/parameters/authorization',
            },
          ],
        },
        { header: { Authorization: 'test' } },
      ).log.entries[0].request.headers[0].value,
    ).toEqual('test');
  });

  it('should work for top level primitives', () => {
    expect(
      oasToHar(
        oas,
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
        oas,
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
        oas,
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
          new Oas({
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
          }),
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
          oas,
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
          oas,
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

  it('should not include objects with undefined sub properties', () => {
    expect(
      oasToHar(
        oas,
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
                      type: 'object',
                      properties: {
                        b: {
                          type: 'string',
                        },
                        c: {
                          type: 'object',
                          properties: {
                            d: {
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
          },
        },
        { body: { a: { b: undefined, c: { d: undefined } } } },
      ).log.entries[0].request.postData.text,
    ).toEqual(undefined);
  });
});

describe('formData values', () => {
  it('should not add on empty unrequired values', () => {
    expect(
      oasToHar(oas, {
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
      }).log.entries[0].request.postData.text,
    ).toEqual(undefined);
  });

  // TODO extensions[SEND_DEFAULTS]
  it.skip('should set defaults if no value provided but is required', () => {
    expect(
      oasToHar(oas, {
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
      }).log.entries[0].request.postData.text,
    ).toEqual(querystring.stringify({ a: 'value' }));
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(
      oasToHar(
        oas,
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
        new Oas({
          components: {
            securitySchemes: {
              'auth-header': {
                type: 'apiKey',
                name: 'x-auth-header',
                in: 'header',
              },
            },
          },
        }),
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [] }],
        },
        {},
        {
          'auth-header': 'value',
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
        new Oas({
          components: {
            securitySchemes: {
              'auth-query': {
                type: 'apiKey',
                name: 'authQuery',
                in: 'query',
              },
            },
          },
        }),
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-query': [] }],
        },
        {},
        {
          'auth-query': 'value',
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
        new Oas({
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
        }),
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [] }, { 'auth-header2': [] }],
        },
        {},
        {
          'auth-header': 'value',
          'auth-header2': 'value',
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
        new Oas({
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
        }),
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [], 'auth-header2': [] }],
        },
        {},
        {
          'auth-header': 'value',
          'auth-header2': 'value',
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
        new Oas({
          components: {
            securitySchemes: {
              'auth-header': {
                type: 'apiKey',
                name: 'x-auth-header',
                in: 'header',
              },
            },
          },
        }),
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-header': [] }],
        },
        {},
        {},
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
    expect(oasToHar(oas, operation, {}).log.entries[0].request.headers).toEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
    expect(oasToHar(oas, operation, { query: { a: 1 } }).log.entries[0].request.headers).toEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
  });

  it('should be sent through if there are any body values', () => {
    expect(
      oasToHar(oas, operation, { body: { a: 'test' } }).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should be sent through if there are any formData values', () => {
    expect(
      oasToHar(oas, operation, { formData: { a: 'test' } }).log.entries[0].request.headers,
    ).toEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should fetch the type from the first `requestBody.content` and first `responseBody.content` object', () => {
    expect(
      oasToHar(
        oas,
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
        oas,
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

  describe('multipart/form-data', () => {
    it('should generate multipart body with values string and number', () => {
      const now = 1592479223953
      const dateNow = Date.now
  
      Date.now = jest.fn(() => now)

      const testOperationPath = {
        path: '/body',
        method: 'post',
        requestBody: {
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary"
                  },
                  "testNumber": {
                    "type": "number"
                  },
                  "testString": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
      const values = { 
        formData: { 
          file: 'data:xx;base64,the-data', 
          testNumber: 111,
          testString: 'this-is-the-string' 
        } 
      }
      const contentType = 'multipart/form-data'

      expect(
        oasToHar(
          oas,
          testOperationPath,
          values,
          {}, {}, 
          contentType
        ).log.entries[0].request.postData.text).toMatchSnapshot()

      Date.now = dateNow
    });
    
    it('should properly generate multipart body with multipart/form-data content-type header', () => {
      const now = Date.now()
      const dateNow = Date.now
  
      Date.now = jest.fn(() => now)
      const har = oasToHar(oas, {
        path: '/body',
        method: 'get',
        requestBody: {
          content: {
            'multipart/form-data': {
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
      }, {formData: {
        'some': 'data:xx;filename=myfile.jpeg;base64,the-data',
      }}, {}, {}, 'multipart/form-data')
      const req = har.log.entries[0]
      expect(req.request.postData.text)
        .toEqual(
          `--${now}\r\nContent-Disposition: form-data; name="some"; filename="myfile.jpeg"\r\n\r\nthe-data\r\n--${now}--\r\n`
        )
  
      Date.now = dateNow
    })
  })

})


describe('x-headers', () => {
  it('should append any static headers to the request', () => {
    expect(
      oasToHar(
        new Oas({
          'x-headers': [
            {
              key: 'x-api-key',
              value: '123456',
            },
          ],
        }),
      ).log.entries[0].request.headers,
    ).toEqual([{ name: 'x-api-key', value: '123456' }]);
  });
});
