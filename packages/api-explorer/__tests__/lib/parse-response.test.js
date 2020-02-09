const { Headers, Response } = require('node-fetch');
const parseResponse = require('../../src/lib/parse-response');

function createHar(har) {
  return {
    log: {
      entries: [{ request: har }],
    },
  };
}

const url = 'https://try.readme.io/http://petstore.swagger.io/v2/pet';
const method = 'POST';

const har = createHar({
  headers: [
    {
      name: 'Authorization',
      value: 'Bearer api-key',
    },
  ],
  method,
  url,
});

const responseBody = JSON.stringify({
  id: 9205436248879918000,
  category: { id: 0 },
  name: '1',
  photoUrls: ['1'],
  tags: [],
});

let response;

beforeEach(() => {
  response = new Response(responseBody, {
    headers: {
      'Content-Type': 'application/json',
      'x-custom-header': 'application/json',
    },
  });
});

test('should pass through URL with proxy removed', async () => {
  expect((await parseResponse(har, response)).url).toBe('http://petstore.swagger.io/v2/pet');
});

test('should pass through URL with query string', async () => {
  expect(
    (
      await parseResponse(
        createHar({
          method,
          url,
          headers: [],
          queryString: [
            {
              name: 'a',
              value: '123456',
            },
          ],
        }),
        response
      )
    ).url
  ).toBe('http://petstore.swagger.io/v2/pet?a=123456');
});

test('should pass through method', async () => {
  expect((await parseResponse(har, response)).method).toBe(method);
});

test('should return array for request headers', async () => {
  expect(
    (
      await parseResponse(
        createHar({
          headers: [
            {
              name: 'Authorization',
              value: 'Bearer api-key',
            },
            {
              name: 'Authorization1',
              value: 'Bearer api-key1',
            },
          ],
          url,
        }),
        response
      )
    ).requestHeaders
  ).toStrictEqual(['Authorization: Bearer api-key', 'Authorization1: Bearer api-key1']);
});

test('should return with post data if set', async () => {
  expect(
    (
      await parseResponse(
        createHar({
          headers: [],
          postData: {
            text: JSON.stringify({ a: 1 }),
          },
          url,
        }),
        response
      )
    ).requestBody
  ).toBe(JSON.stringify({ a: 1 }));
});

test('should return with null if postData is empty object', async () => {
  expect(
    (
      await parseResponse(
        createHar({
          headers: [],
          postData: {},
          url,
        }),
        response
      )
    ).requestBody
  ).toBeNull();
});

test('should return with null if postData is undefined', async () => {
  expect(
    (
      await parseResponse(
        createHar({
          headers: [],
          url,
        }),
        response
      )
    ).requestBody
  ).toBeNull();
});

test('should return array for response headers', async () => {
  expect((await parseResponse(har, response)).responseHeaders).toStrictEqual([
    'content-type: application/json',
    'x-custom-header: application/json',
  ]);
});

test('should return `type` from content-type header', async () => {
  expect((await parseResponse(har, response)).type).toBe('application/json');
});

test('should autodetect a content-type if content-type header missing', async () => {
  expect((await parseResponse(har, new Response(responseBody))).type).toBe('text/plain;charset=UTF-8');
});

test('should remove x-final-url header set by the proxy', async () => {
  expect(
    (
      await parseResponse(
        har,
        new Response('', {
          headers: { 'x-final-url': 'http://example.com' },
        })
      )
    ).responseHeaders
  ).toStrictEqual(['content-type: text/plain;charset=UTF-8']);
});

test('should pass through status', async () => {
  const status = 200;
  expect((await parseResponse(har, new Response('', { status }))).status).toBe(status);
});

test('isBinary should be true if there is a content-disposition response header', async () => {
  const binaryHeaders = new Headers();
  binaryHeaders.set('Content-Disposition', 'attachment; filename="example.txt"');
  expect((await parseResponse(har, new Response('', { headers: binaryHeaders }))).isBinary).toBe(true);
});

test('should parse application/json response as json', async () => {
  expect((await parseResponse(har, response)).responseBody).toStrictEqual(JSON.parse(responseBody));
});

test('should parse application/vnd.api+json as json', async () => {
  response.headers['Content-Type'] = 'application/vnd.api+json';
  expect((await parseResponse(har, response)).responseBody).toStrictEqual(JSON.parse(responseBody));
});

test('should parse non-json response as text', async () => {
  const nonJsonResponseBody = '<xml-string />';
  const nonJsonResponse = new Response('<xml-string />', {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  expect((await parseResponse(har, nonJsonResponse)).responseBody).toStrictEqual(nonJsonResponseBody);
});

test('should not error if invalid json is returned', async () => {
  const invalidJsonResponse = new Response('plain text', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  expect((await parseResponse(har, invalidJsonResponse)).responseBody).toBe('plain text');
});
