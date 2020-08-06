const extensions = require('@readme/oas-extensions');
const Oas = require('@readme/oas-tooling');
const path = require('path');
const datauri = require('datauri');

const oasToHar = require('../src/index');
const commonParameters = require('./__fixtures__/common-parameters');

const oas = new Oas();

test('should output a har format', async () => {
  const har = oasToHar(oas);

  await expect(har).toBeAValidHAR();
  expect(har).toStrictEqual({
    log: {
      entries: [
        {
          request: {
            bodySize: 0,
            cookies: [],
            headers: [],
            headersSize: 0,
            httpVersion: 'HTTP/1.1',
            method: '',
            queryString: [],
            url: 'https://example.com',
          },
        },
      ],
    },
  });
});

test('should uppercase the method', async () => {
  const har = oasToHar(oas, { path: '/', method: 'get' });

  expect(har.log.entries[0].request.method).toBe('GET');
  await expect(har).toBeAValidHAR();
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

describe('parameters', () => {
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

    it.each([
      [
        'should not error if empty object passed in for values',
        {
          parameters: [{ name: 'id', in: 'path', required: true }],
        },
        {},
        'https://example.com/param-path/id',
      ],
      [
        'should use example if no value',
        {
          parameters: [{ name: 'id', in: 'path', required: true, example: '123' }],
        },
        {},
        'https://example.com/param-path/123',
      ],
      [
        'should add path values to the url',
        {
          parameters: [{ name: 'id', in: 'path', required: true }],
        },
        { path: { id: '456' } },
        'https://example.com/param-path/456',
      ],
      [
        'should add falsy values to the url',
        {
          parameters: [{ name: 'id', in: 'path', required: true }],
        },
        { path: { id: 0 } },
        'https://example.com/param-path/0',
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedUrl) => {
      const har = oasToHar(
        oas,
        {
          path: '/param-path/{id}',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.url).toStrictEqual(expectedUrl);
    });
  });

  describe('query values', () => {
    it.each([
      [
        'should not add on empty unrequired values',
        {
          parameters: [{ name: 'a', in: 'query' }],
        },
      ],
      [
        'should set defaults if no value provided but is required',
        {
          parameters: [{ name: 'a', in: 'query', required: true, example: 'value' }],
        },
        {},
        [{ name: 'a', value: 'value' }],
      ],
      [
        'should pass in value if one is set and prioritise provided values',
        {
          parameters: [{ name: 'a', in: 'query', required: true, example: 'value' }],
        },
        { query: { a: 'test' } },
        [{ name: 'a', value: 'test' }],
      ],
      [
        'should add falsy values to the querystring',
        {
          parameters: [{ name: 'id', in: 'query' }],
        },
        { query: { id: 0 } },
        [{ name: 'id', value: '0' }],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedQueryString = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/query',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.queryString).toStrictEqual(expectedQueryString);
    });
  });

  describe('cookie values', () => {
    it.each([
      [
        'should not add on empty unrequired values',
        {
          parameters: [{ name: 'a', in: 'cookie' }],
        },
      ],
      [
        'should set defaults if no value provided but is required',
        {
          parameters: [{ name: 'a', in: 'cookie', required: true, example: 'value' }],
        },
        {},
        [{ name: 'a', value: 'value' }],
      ],
      [
        'should pass in value if one is set and prioritize provided values',
        {
          parameters: [{ name: 'a', in: 'cookie', required: true, example: 'value' }],
        },
        { cookie: { a: 'test' } },
        [{ name: 'a', value: 'test' }],
      ],
      [
        'should add falsy values to the cookies',
        {
          parameters: [{ name: 'id', in: 'cookie' }],
        },
        { cookie: { id: 0 } },
        [{ name: 'id', value: '0' }],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedCookies = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.cookies).toStrictEqual(expectedCookies);
    });
  });

  describe('header values', () => {
    it.each([
      [
        'should not add on empty unrequired values',
        {
          parameters: [{ name: 'a', in: 'header' }],
        },
      ],
      [
        'should set defaults if no value provided but is required',
        {
          parameters: [{ name: 'a', in: 'header', required: true, example: 'value' }],
        },
        {},
        [{ name: 'a', value: 'value' }],
      ],
      [
        'should pass in value if one is set and prioritise provided values',
        {
          parameters: [{ name: 'a', in: 'header', required: true, example: 'value' }],
        },
        { header: { a: 'test' } },
        [{ name: 'a', value: 'test' }],
      ],
      [
        'should pass accept header if endpoint expects a content back from response',
        {
          parameters: [{ name: 'a', in: 'header', required: true, example: 'value' }],
          responses: {
            200: {
              content: {
                'application/xml': { type: 'array' },
                'application/json': { type: 'array' },
              },
            },
          },
        },
        {},
        [
          { name: 'Accept', value: 'application/xml' },
          { name: 'a', value: 'value' },
        ],
      ],
      [
        'should only add one accept header',
        {
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
        {},
        [{ name: 'Accept', value: 'application/xml' }],
      ],
      [
        'should only receive one accept header if specified in values',
        {
          parameters: [{ name: 'Accept', in: 'header' }],
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
        [{ name: 'Accept', value: 'application/xml' }],
      ],
      [
        'should add accept header if specified in formdata',
        {
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
        [{ name: 'Accept', value: 'application/xml' }],
      ],
      [
        'should add falsy values to the headers',
        {
          parameters: [{ name: 'id', in: 'header' }],
        },
        { header: { id: 0 } },
        [{ name: 'id', value: '0' }],
      ],
    ])('%s', async (testCase, operation = {}, values = {}, expectedHeaders = []) => {
      const har = oasToHar(
        oas,
        {
          path: '/header',
          method: 'get',
          ...operation,
        },
        values
      );

      await expect(har).toBeAValidHAR();

      expect(har.log.entries[0].request.headers).toStrictEqual(expectedHeaders);
    });
  });
});

describe('requestBody', () => {
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

      expect(oasToHar(oas, pathOperation).log.entries[0].request.postData).toBeUndefined();
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
        ).log.entries[0].request.postData
      ).toBeUndefined();
    });

    describe('content types', () => {
      it.todo('should support vendor-prefixed json content types');

      describe.skip('multipart/form-data', () => {
        let owlbert;

        beforeAll(async () => {
          owlbert = await datauri(path.join(__dirname, '__fixtures__', 'owlbert.png'));

          // Doing this manually for now until when/if https://github.com/data-uri/datauri/pull/29 is accepted.
          owlbert = owlbert.replace(';base64', `;name=${encodeURIComponent('owlbert.png')};base64`);
        });

        const oasFixture = new Oas({
          components: {
            requestBodies: {
              payload: {
                required: true,
                content: {
                  'multipart/form-data': {
                    schema: {
                      type: 'object',
                      properties: {
                        orderId: {
                          type: 'integer',
                        },
                        userId: {
                          type: 'integer',
                        },
                        documentFile: {
                          type: 'string',
                          format: 'binary',
                        },
                      },
                    },
                  },
                },
              },
            },
            securitySchemes: {
              bearerAuth: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
              },
            },
          },
        });

        const operation = {
          path: '/multipart',
          method: 'post',
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            $ref: '#/components/requestBodies/payload',
          },
          responses: {
            default: {
              description: 'OK',
            },
          },
        };

        it('should handle multipart/form-data request bodies', () => {
          const har = oasToHar(oasFixture, operation, {
            body: { orderId: 12345, userId: 67890, documentFile: owlbert },
          });

          expect(har.log.entries[0].request.headers).toStrictEqual([
            { name: 'Content-Type', value: 'multipart/form-data' },
          ]);

          expect(har.log.entries[0].request.postData).toStrictEqual({
            mimeType: 'multipart/form-data',
            params: [
              { name: 'orderId', value: '12345' },
              { name: 'userId', value: '67890' },
              { name: 'documentFile', value: owlbert },
            ],
          });
        });

        it('should handle a multipart/form-data file request bodies and decode files if `decodeDataUrl` is set', () => {
          const har = oasToHar(
            oasFixture,
            operation,
            { body: { orderId: 12345, userId: 67890, documentFile: owlbert } },
            {},
            {
              decodeDataUrl: true,
            }
          );

          expect(har.log.entries[0].request.postData).toStrictEqual({
            mimeType: 'multipart/form-data',
            params: [
              { name: 'orderId', value: '12345' },
              { name: 'userId', value: '67890' },
              {
                contentType: 'image/png',
                fileName: 'owlbert.png',
                name: 'documentFile',
                value: owlbert,
              },
            ],
          });
        });
      });

      describe.skip('image/png', () => {
        it('should handle a image/png request body', async () => {
          let owlbert = await datauri(path.join(__dirname, '__fixtures__', 'owlbert.png'));

          // Doing this manually for now until when/if https://github.com/data-uri/datauri/pull/29 is accepted.
          owlbert = owlbert.replace(';base64', `;name=${encodeURIComponent('owlbert.png')};base64`);

          const har = oasToHar(
            oas,
            {
              path: '/',
              method: 'post',
              responses: {
                200: {
                  description: 'OK',
                },
              },
              requestBody: {
                content: {
                  'image/png': {
                    schema: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
            { body: owlbert }
          );

          await expect(har).toBeAValidHAR();

          // The `postData` contents here should be the data URL of the image for a couple reasons:
          //
          //  1. The HAR spec doesn't have support for covering a case where you're making a PUT request to an endpoint
          //    with the contents of a file, eg. `curl -T filename.png`. Since there's no parameter name, as this is
          //    the entire content of the payload body, we can't promote this up to `postData.params`.
          //  2. Since the HAR spec doesn't have support for this, neither does https://github.com/Kong/httpsnippet,
          //    which we couple with this library to generate code snippets. Since that doesn't have support for
          //    `curl -T filename.png` cases, the only thing we can do is just set the data URL of the file as the
          //    content of `postData.text`.
          //
          //  It's less than ideal, and code snippets for these kinds of operations are going to be extremely ugly, but
          //  there isn't anything we can do about it.
          expect(har.log.entries[0].request.postData.mimeType).toBe('image/png');
          expect(har.log.entries[0].request.postData.text).toBe(`"${owlbert}"`);
        });
      });
    });

    describe('format: `json`', () => {
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

      it.todo('can handle cases where a json property is deep-nested');

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
        }).log.entries[0].request.postData
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
        ).log.entries[0].request.postData.params
      ).toStrictEqual([
        { name: 'a', value: 'test' },
        { name: 'b', value: '1,2,3' },
      ]);
    });
  });
});

describe('common parameters', () => {
  const operation = {
    ...commonParameters.paths['/anything/{id}'].post,
    path: '/anything/{id}',
    method: 'post',
  };

  it('should work for common parameters', async () => {
    const har = oasToHar(new Oas(commonParameters), operation, {
      path: { id: 1234 },
      header: { 'x-extra-id': 'abcd' },
      query: { limit: 10 },
      cookie: { authtoken: 'password' },
    });

    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request).toStrictEqual({
      bodySize: 0,
      cookies: [{ name: 'authtoken', value: 'password' }],
      headers: [{ name: 'x-extra-id', value: 'abcd' }],
      headersSize: 0,
      httpVersion: 'HTTP/1.1',
      queryString: [{ name: 'limit', value: '10' }],
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
      cookie: { authtoken: 'password' },
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

  it('should work for cookie', () => {
    expect(
      oasToHar(
        new Oas({
          components: {
            securitySchemes: {
              'auth-cookie': {
                type: 'apiKey',
                name: 'authCookie',
                in: 'cookie',
              },
            },
          },
        }),
        {
          path: '/security',
          method: 'get',
          security: [{ 'auth-cookie': [] }],
        },
        {},
        {
          'auth-cookie': 'value',
        }
      ).log.entries[0].request.cookies
    ).toStrictEqual([
      {
        name: 'authCookie',
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

  it('should be sent through if there are no body values but there is a requestBody', async () => {
    let har = oasToHar(oas, operation, {});

    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'application/json' }]);

    har = oasToHar(oas, operation, { query: { a: 1 } });
    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should be sent through if there are any body values', async () => {
    const har = oasToHar(oas, operation, { body: { a: 'test' } });

    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should be sent through if there are any formData values', async () => {
    const har = oasToHar(oas, operation, { formData: { a: 'test' } });
    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it('should fetch the type from the first `requestBody.content` and first `responseBody.content` object', async () => {
    const har = oasToHar(
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
    );

    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'text/xml' }]);
    expect(har.log.entries[0].request.postData.mimeType).toStrictEqual('text/xml');
  });

  // Whether this is right or wrong, i'm not sure but this is what readme currently does
  it('should prioritise json if it exists', async () => {
    const har = oasToHar(
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
    );

    await expect(har).toBeAValidHAR();
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'application/json' }]);
  });

  it("should only add a content-type if one isn't already present", async () => {
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
      },
      { body: { a: 'test' } }
    );

    await expect(har).toBeAValidHAR();

    // `Content-Type: application/json` would normally appear here if there were no `x-headers`, but since there is
    // we should default to that so as to we don't double up on Content-Type headers.
    expect(har.log.entries[0].request.headers).toStrictEqual([{ name: 'Content-Type', value: 'multipart/form-data' }]);

    expect(har.log.entries[0].request.postData.mimeType).toStrictEqual('multipart/form-data');
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
