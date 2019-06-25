const parseResponse = require('../../src/lib/parse-response');
const { Headers, Response } = require('node-fetch');

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
    (await parseResponse(
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
      response,
    )).url,
  ).toBe('http://petstore.swagger.io/v2/pet?a=123456');
});

test('should pass through method', async () => {
  expect((await parseResponse(har, response)).method).toBe(method);
});

test('should return array for request headers', async () => {
  expect(
    (await parseResponse(
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
      response,
    )).requestHeaders,
  ).toEqual(['Authorization: Bearer api-key', 'Authorization1: Bearer api-key1']);
});

test('should return with post data if set', async () => {
  expect(
    (await parseResponse(
      createHar({
        headers: [],
        postData: {
          text: JSON.stringify({ a: 1 }),
        },
        url,
      }),
      response,
    )).requestBody,
  ).toEqual(JSON.stringify({ a: 1 }));
});

test('should return with null if postData is empty object', async () => {
  expect(
    (await parseResponse(
      createHar({
        headers: [],
        postData: {},
        url,
      }),
      response,
    )).requestBody,
  ).toEqual(null);
});

test('should return with null if postData is undefined', async () => {
  expect(
    (await parseResponse(
      createHar({
        headers: [],
        url,
      }),
      response,
    )).requestBody,
  ).toEqual(null);
});

test('should return array for response headers', async () => {
  expect((await parseResponse(har, response)).responseHeaders).toEqual([
    {
      name: 'content-type',
      value: 'application/json'
    },
    {
      name: 'x-custom-header',
      value: 'application/json'
    },
  ]);
});

test('should return `type` from content-type header', async () => {
  expect((await parseResponse(har, response)).type).toEqual('application/json');
});

// NB: new Response sets by default the Content-Type header to "text/plain;charset=UTF-8".
// test('should return null for `type` if content-type header missing', async () => {
//   expect((await parseResponse(har, new Response(responseBody))).type).toEqual(null);
// });

// NB: new Response sets by default the Content-Type header to "text/plain;charset=UTF-8".
test('should remove x-final-url header set by the proxy', async () => {
  expect(
    (await parseResponse(
      har,
      new Response('', {
        headers: { 'x-final-url': 'http://example.com' },
      }),
    )).responseHeaders,
  ).toEqual([{
    name:'content-type', 
    value: 'text/plain;charset=UTF-8'
  }]);
});

test('should pass through status', async () => {
  const status = 200;
  expect((await parseResponse(har, new Response('', { status }))).status).toEqual(status);
});

test('isBinary should be true if there is a content-disposition response header', async () => {
  const binaryHeaders = new Headers();
  binaryHeaders.set('Content-Disposition', 'attachment; filename="example.txt"');
  expect((await parseResponse(har, new Response('', { headers: binaryHeaders }))).isBinary).toEqual(
    true,
  );
});

test('should parse application/json response as json', async () => {
  expect((await parseResponse(har, response)).responseBody).toEqual(JSON.parse(responseBody));
});

test('should parse application/vnd.api+json as json', async () => {
  response.headers['Content-Type'] = 'application/vnd.api+json';
  expect((await parseResponse(har, response)).responseBody).toEqual(JSON.parse(responseBody));
});

test('should parse non-json response as text', async () => {
  const nonJsonResponseBody = '<xml-string />';
  const nonJsonResponse = new Response('<xml-string />', {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  expect((await parseResponse(har, nonJsonResponse)).responseBody).toEqual(nonJsonResponseBody);
});

test('should not error if invalid json is returned', async () => {
  const invalidJsonResponse = new Response('plain text', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  expect((await parseResponse(har, invalidJsonResponse)).responseBody).toEqual('plain text');
});
