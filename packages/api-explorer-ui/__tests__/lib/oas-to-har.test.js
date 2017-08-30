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
  expect(oasToHar({}, { path: '/', method: 'get' }).method).toBe('GET');
});

describe('url', () => {
  test('should default to ""', () => {
    expect(oasToHar({}, { path: '', method: '' }).url).toBe('');
    expect(oasToHar({}, { path: '/path', method: '' }).url).toBe('/path');
  });

  test('should be constructed from servers[0]', () => {
    expect(oasToHar({
      servers: [{ url: 'http://example.com' }],
    }, { path: '/path', method: 'get' }).url).toBe('http://example.com/path');
  });

  test('should replace whitespace with %20', () => {
    expect(oasToHar({
      servers: [{ url: 'http://example.com' }],
    }, { path: '/path with spaces', method: '' }).url).toBe('http://example.com/path%20with%20spaces');
  });

  test('should replace path params with values');
});

describe('path values', () => {
  test('should pass through unknown path params', () => {
    expect(oasToHar({}, { path: '/param-path/{id}', method: '' }).url).toBe('/param-path/id');
    expect(oasToHar({}, {
      path: '/param-path/{id}',
      method: 'get',
      parameters: [
        {
          name: 'something-else',
          in: 'path',
          required: true,
        },
      ],
    }).url).toBe('/param-path/id');
  });

  test('should not error if empty object passed in for values', () => {
    expect(oasToHar({}, {
      path: '/param-path/{id}',
      method: 'get',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
        },
      ],
    }, {}).url).toBe('/param-path/id');
  });

  test('should use example if no value', () => {
    expect(oasToHar({}, {
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
    }).url).toBe('/param-path/123');
  });

  test('should add path values to the url', () => {
    expect(oasToHar({}, {
      path: '/param-path/{id}',
      method: 'get',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
        },
      ],
    }, { path: { id: '456' } }).url).toBe('/param-path/456');
  });
});

describe('query values', () => {
  it('should not add on empty unrequired values', () => {
    expect(oasToHar({}, {
      path: '/query',
      method: 'get',
      parameters: [
        {
          name: 'a',
          in: 'query',
        },
      ],
    }).queryString).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(oasToHar({}, {
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
    }).queryString).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(oasToHar({}, {
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
    }, { query: { a: 'test' } }).queryString).toEqual([{ name: 'a', value: 'test' }]);
  });
});

describe('header values', () => {
  it('should not add on empty unrequired values', () => {
    expect(oasToHar({}, {
      path: '/header',
      method: 'get',
      parameters: [
        {
          name: 'a',
          in: 'header',
        },
      ],
    }).headers).toEqual([]);
  });

  it('should set defaults if no value provided but is required', () => {
    expect(oasToHar({}, { path: '/header',
      method: 'get',
      parameters: [
        {
          name: 'a',
          in: 'header',
          required: true,
          example: 'value',
        },
      ],
    }).headers).toEqual([{ name: 'a', value: 'value' }]);
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(oasToHar({}, {
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
    }, { header: { a: 'test' } }).headers).toEqual([{ name: 'a', value: 'test' }]);
  });
});

describe('body values', () => {
  it('should not add on empty unrequired values', () => {
    expect(oasToHar({}, {
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
    }).postData.text).toEqual(undefined);
  });

  // TODO extensions[SEND_DEFAULTS]
  it.skip('should set defaults if no value provided but is required', () => {
    expect(oasToHar({}, {
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
    }).postData.text).toEqual(JSON.stringify({ a: 'value' }));
  });

  it('should pass in value if one is set and prioritise provided values', () => {
    expect(oasToHar({}, {
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
    }, { body: { a: 'test' } }).postData.text).toEqual(JSON.stringify({ a: 'test' }));
  });
});

describe('form data values', () => {});
