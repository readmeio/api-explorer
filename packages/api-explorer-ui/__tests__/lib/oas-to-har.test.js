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

  it('should replace whitespace with %20', () => {
    expect(oasToHar({
      servers: [{ url: 'http://example.com' }],
    }, '/path with spaces', '').url).toBe('http://example.com/path%20with%20spaces');
  });

  it('should replace path params with values');
});

