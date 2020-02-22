const querystring = require('querystring');
const extensions = require('@readme/oas-extensions');
const Oas = require('@readme/oas-tooling');

const oasToHar = require('../src/index');
const commonParameters = require('./fixtures/common-parameters');

const oas = new Oas();

test('should output a har format', () => {
  expect(oasToHar(oas)).toStrictEqual({
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
  it('should be constructed from oas.url()', () => {
    expect(oasToHar(oas, { path: '', method: 'get' }).log.entries[0].request.url).toBe(oas.url());
  });

  // TODO this should probably happen within the Operation class
  it('should replace whitespace with %20', () => {
    expect(oasToHar(oas, { path: '/path with spaces', method: '' }).log.entries[0].request.url).toBe(
      'https://example.com/path%20with%20spaces'
    );
  });

  describe('proxy url', () => {
    const proxyOas = new Oas({
      [extensions.PROXY_ENABLED]: true,
    });

    it('should not be prefixed with without option', () => {
      expect(oasToHar(proxyOas, { path: '/path', method: 'get' }).log.entries[0].request.url).toBe(
        'https://example.com/path'
      );
    });

    it('should be prefixed with try.readme.io with option', () => {
      expect(
        oasToHar(proxyOas, { path: '/path', method: 'get' }, {}, {}, { proxyUrl: true }).log.entries[0].request.url
      ).toBe('https://try.readme.io/https://example.com/path');
    });
  });
});

describe('path values', () => {
  it('should pass through unknown path params', () => {
    expect(oasToHar(oas, { path: '/param-path/{id}', method: '' }).log.entries[0].request.url).toBe(
      'https://example.com/param-path/id'
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
      }).log.entries[0].request.url
    ).toBe('https://example.com/param-path/id');
  });

  it('should not error if empty object passed in for values', () => {
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
        {}
      ).log.entries[0].request.url
    ).toBe('https://example.com/param-path/id');
  });

  it('should use example if no value', () => {
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
      }).log.entries[0].request.url
    ).toBe('https://example.com/param-path/123');
  });

  it('should add path values to the url', () => {
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
        { path: { id: '456' } }
      ).log.entries[0].request.url
    ).toBe('https://example.com/param-path/456');
  });

  it('should add falsy values to the url', () => {
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
        { path: { id: 0 } }
      ).log.entries[0].request.url
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
      }).log.entries[0].request.queryString
    ).toStrictEqual([]);
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
      }).log.entries[0].request.queryString
    ).toStrictEqual([{ name: 'a', value: 'value' }]);
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
        { query: { a: 'test' } }
      ).log.entries[0].request.queryString
    ).toStrictEqual([{ name: 'a', value: 'test' }]);
  });

  it('should add falsy values to the querystring', () => {
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
        { query: { id: 0 } }
      ).log.entries[0].request.queryString
    ).toStrictEqual([{ name: 'id', value: '0' }]);
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
      }).log.entries[0].request.headers
    ).toStrictEqual([]);
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
      }).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'a', value: 'value' }]);
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
        { header: { a: 'test' } }
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'a', value: 'test' }]);
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
      }).log.entries[0].request.headers
    ).toStrictEqual([
      { name: 'Accept', value: 'application/xml' },
      { name: 'a', value: 'value' },
    ]);
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
      }).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'Accept', value: 'application/xml' }]);
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
        { header: { Accept: 'application/xml' } }
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'Accept', value: 'application/xml' }]);
  });

  it('should add accept header if specified in formdata', () => {
    expect(
      oasToHar(
        oas,
        {
          path: '/header',
          method: 'get',
          parameters: [],
          responses: {
            200: {
              content: {
                'application/json': {},
                'application/xml': {},
              },
            },
          },
        },
        { header: { Accept: 'application/xml' } }
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'Accept', value: 'application/xml' }]);
  });

  it('should add falsy values to the headers', () => {
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
        { header: { id: 0 } }
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'id', value: '0' }]);
  });
});

describe('body values', () => {
  it('should not add on empty unrequired values', () => {
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

    expect(oasToHar(oas, pathOperation).log.entries[0].request.postData.text).toBeUndefined();
  });

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
      }).log.entries[0].request.postData.text
    ).toBe(JSON.stringify({ a: 'value' }));
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
        { body: { a: 'test' } }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify({ a: 'test' }));
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
        { body: { RAW_BODY: 'test' } }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify('test'));
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
        { body: { RAW_BODY: '{ "a": 1 }' } }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify({ a: 1 }));
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
        { body: { RAW_BODY: '' } }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify(''));
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
        { body: { RAW_BODY: { a: 'test' } } }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify({ a: 'test' }));
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
        { body: { RAW_BODY: {} } }
      ).log.entries[0].request.postData.text
    ).toBeUndefined();
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
        { body: { a: undefined } }
      ).log.entries[0].request.postData.text
    ).toBeUndefined();
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
        { body: { a: 123 } }
      ).log.entries[0].request.postData.text
    ).toStrictEqual(JSON.stringify({ a: 123 }));
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
        { header: { Authorization: 'test' } }
      ).log.entries[0].request.headers[0].value
    ).toBe('test');
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
        { body: 'string' }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify('string'));

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
        { body: 123 }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify(123));

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
        { body: true }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify(true));
  });

  it('should work for top level falsy primitives', () => {
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
        { body: '' }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify(''));

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
        { body: 0 }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify(0));

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
        { body: false }
      ).log.entries[0].request.postData.text
    ).toBe(JSON.stringify(false));
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
          { body: { a: '{ "b": 1 }' } }
        ).log.entries[0].request.postData.text
      ).toBe(JSON.stringify({ a: JSON.parse('{ "b": 1 }') }));
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
          { body: { a: '{ "b": invalid json' } }
        ).log.entries[0].request.postData.text
      ).toBe(JSON.stringify({ a: '{ "b": invalid json' }));
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
          { body: { a: '{ "b": "valid json" }' } }
        ).log.entries[0].request.postData.text
      ).toBe(JSON.stringify({ a: JSON.parse('{ "b": "valid json" }') }));
    });

    it('should leave user specified empty object JSON alone', () => {
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
          { body: { a: '{}' } }
        ).log.entries[0].request.postData.text
      ).toBe(JSON.stringify({ a: {} }));
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
        { body: { a: { b: undefined, c: { d: undefined } } } }
      ).log.entries[0].request.postData.text
    ).toBeUndefined();
  });

  // When we first render the form, formData.body is undefined
  // until something is typed into the form. When using anyOf/oneOf
  // if we change the schema before typing anything into the form,
  // then onChange is fired with `undefined` which causes
  // this to error
  it('should not error if `formData.body` is undefined', () => {
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
        { body: undefined }
      ).log.entries[0].request.postData.text
    ).toBeUndefined();
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
      }).log.entries[0].request.postData.text
    ).toBeUndefined();
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
      }).log.entries[0].request.postData.text
    ).toBe(querystring.stringify({ a: 'value' }));
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
        { formData: { a: 'test', b: [1, 2, 3] } }
      ).log.entries[0].request.postData.text
    ).toBe(querystring.stringify({ a: 'test', b: [1, 2, 3] }));
  });
});

describe('common parameters', () => {
  const operation = {
    ...commonParameters.paths['/anything/{id}'].post,
    path: '/anything/{id}',
    method: 'post',
  };

  it('should work for common parameters', () => {
    expect(
      oasToHar(new Oas(commonParameters), operation, {
        path: { id: 1234 },
        header: { 'x-extra-id': 'abcd' },
        query: { limit: 10 },
      }).log.entries[0].request
    ).toStrictEqual({
      headers: [{ name: 'x-extra-id', value: 'abcd' }],
      queryString: [{ name: 'limit', value: '10' }],
      postData: {},
      method: 'POST',
      url: 'http://httpbin.org/anything/1234',
    });
  });

  it('should not mutate the original pathOperation that was passed in', () => {
    const existingCount = operation.parameters.length;

    oasToHar(new Oas(commonParameters), operation, {
      path: { id: 1234 },
      header: { 'x-extra-id': 'abcd' },
      query: { limit: 10 },
    });

    expect(operation.parameters).toHaveLength(existingCount);
  });
});

describe('auth', () => {
  it('should work for header', () => {
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
        }
      ).log.entries[0].request.headers
    ).toStrictEqual([
      {
        name: 'x-auth-header',
        value: 'value',
      },
    ]);
  });

  it('should work for query', () => {
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
        }
      ).log.entries[0].request.queryString
    ).toStrictEqual([
      {
        name: 'authQuery',
        value: 'value',
      },
    ]);
  });

  it('should work for multiple (||)', () => {
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
        }
      ).log.entries[0].request.headers
    ).toStrictEqual([
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

  it('should work for multiple (&&)', () => {
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
        }
      ).log.entries[0].request.headers
    ).toStrictEqual([
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

  it('should not set non-existent values', () => {
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
        {}
      ).log.entries[0].request.headers
    ).toStrictEqual([]);
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
    expect(oasToHar(oas, operation, {}).log.entries[0].request.headers).toStrictEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
    expect(oasToHar(oas, operation, { query: { a: 1 } }).log.entries[0].request.headers).toStrictEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
  });

  it('should be sent through if there are any body values', () => {
    expect(oasToHar(oas, operation, { body: { a: 'test' } }).log.entries[0].request.headers).toStrictEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
  });

  it('should be sent through if there are any formData values', () => {
    expect(oasToHar(oas, operation, { formData: { a: 'test' } }).log.entries[0].request.headers).toStrictEqual([
      { name: 'Content-Type', value: 'application/json' },
    ]);
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
        { body: { a: 'test' } }
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'Content-Type', value: 'text/xml' }]);
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
        { body: { a: 'test' } }
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it("should only add a content-type if one isn't already present", () => {
    const har = oasToHar(
      new Oas({
        'x-headers': [{ key: 'Content-Type', value: 'multipart/form-data' }],
      }),
      {
        path: '/',
        method: 'put',
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
      }
    );

    // `Content-Type: application/json` would normally appear here if there were no `x-headers`, but since there is
    // we should default to that so as to we don't double up on Content-Type headers.
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'multipart/form-data' }]);
  });
});

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
        })
      ).log.entries[0].request.headers
    ).toStrictEqual([{ name: 'x-api-key', value: '123456' }]);
  });
});
