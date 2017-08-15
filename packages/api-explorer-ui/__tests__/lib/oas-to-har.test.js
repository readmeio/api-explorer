const oasToHar = require('../../src/lib/oas-to-har');

test('should output a har format', () => {
  expect(oasToHar({})).toEqual({
    headers: [],
    queryString: [],
    postData: {},
    method: '',
    url: '',
  });
});

test('should uppercase the method', () => {
  expect(oasToHar({}, '/', 'get').method).toBe('GET');
});

describe('url', () => {
  test('should default to ""', () => {
    expect(oasToHar({}, '', '').url).toBe('');
    expect(oasToHar({}, '/path', '').url).toBe('/path');
  });

  test('should be constructed from servers[0]', () => {
    expect(oasToHar({
      servers: [{ url: 'http://example.com' }],
    }, '/path', '').url).toBe('http://example.com/path');
  });

  test('should replace whitespace with %20', () => {
    expect(oasToHar({
      servers: [{ url: 'http://example.com' }],
    }, '/path with spaces', '').url).toBe('http://example.com/path%20with%20spaces');
  });

  test('should replace path params with values');
});

describe('path values', () => {
  test('should pass through unknown path params', () => {
    expect(oasToHar({}, '/param-path/{id}', '').url).toBe('/param-path/id');
    expect(oasToHar({
      paths: {
        '/param-path/{id}': {
          get: {
            parameters: [
              {
                name: 'something-else',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    }, '/param-path/{id}', 'get').url).toBe('/param-path/id');
  });

  test('should not error if empty object passed in for values', () => {
    expect(oasToHar({
      paths: {
        '/param-path/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    }, '/param-path/{id}', 'get', {}).url).toBe('/param-path/id');
  });

  test('should use example if no value', () => {
    expect(oasToHar({
      paths: {
        '/param-path/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                example: '123',
              },
            ],
          },
        },
      },
    }, '/param-path/{id}', 'get').url).toBe('/param-path/123');
  });

  test('should add path values to the url', () => {
    expect(oasToHar({
      paths: {
        '/param-path/{id}': {
          get: {
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
              },
            ],
          },
        },
      },
    }, '/param-path/{id}', 'get', { path: { id: '456' } }).url).toBe('/param-path/456');
  });
});

describe('query values', () => {
  it('should not add on empty unrequired values', () => {
    expect(oasToHar({
      paths: {
        '/query': {
          get: {
            parameters: [
              {
                name: 'a',
                in: 'query',
              },
            ],
          },
        },
      },
    }, '/query', 'get').queryString).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(oasToHar({
      paths: {
        '/query': {
          get: {
            parameters: [
              {
                name: 'a',
                in: 'query',
                required: true,
                example: 'value',
              },
            ],
          },
        },
      },
    }, '/query', 'get').queryString).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(oasToHar({
      paths: {
        '/query': {
          get: {
            parameters: [
              {
                name: 'a',
                in: 'query',
                required: true,
                example: 'value',
              },
            ],
          },
        },
      },
    }, '/query', 'get', { query: { a: 'test' } }).queryString).toEqual([{ name: 'a', value: 'test' }]);
  });
});

describe('header values', () => {
  it('should not add on empty unrequired values', () => {
    expect(oasToHar({
      paths: {
        '/header': {
          get: {
            parameters: [
              {
                name: 'a',
                in: 'header',
              },
            ],
          },
        },
      },
    }, '/header', 'get').headers).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(oasToHar({
      paths: {
        '/header': {
          get: {
            parameters: [
              {
                name: 'a',
                in: 'header',
                required: true,
                example: 'value',
              },
            ],
          },
        },
      },
    }, '/header', 'get').headers).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(oasToHar({
      paths: {
        '/header': {
          get: {
            parameters: [
              {
                name: 'a',
                in: 'header',
                required: true,
                example: 'value',
              },
            ],
          },
        },
      },
    }, '/header', 'get', { header: { a: 'test' } }).headers).toEqual([{ name: 'a', value: 'test' }]);
  });
});

describe('body values', () => {
  it.skip('should not add on empty unrequired values', () => {
    expect(oasToHar({
      paths: {
        '/body': {
          get: {
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
        },
      },
    }, '/body', 'get').postData.text).toEqual('');
  });

  it.skip('should set defaults if no value provided but is required', () => {
    expect(oasToHar({
      paths: {
        '/body': {
          get: {
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
        },
      },
    }, '/body', 'get').postData.text).toEqual(JSON.stringify({ a: 'value' }));
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(oasToHar({
      paths: {
        '/body': {
          get: {
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
        },
      },
    }, '/body', 'get', { body: { a: 'test' } }).postData.text).toEqual(JSON.stringify({ a: 'test' }));
  });
});

describe('form data values', () => {})
