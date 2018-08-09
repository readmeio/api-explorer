const codeSampleResponse = require('../../src/lib/parse-response');
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
  expect((await codeSampleResponse(har, response)).url).toBe('http://petstore.swagger.io/v2/pet');
});

test('should pass through URL with query string', async () => {
  expect(
    (await codeSampleResponse(
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
  expect((await codeSampleResponse(har, response)).method).toBe(method);
});

test('should return array for request headers', async () => {
  expect(
    (await codeSampleResponse(
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

test('should return array for response headers', async () => {
  expect((await codeSampleResponse(har, response)).responseHeaders).toEqual([
    'content-type: application/json',
    'x-custom-header: application/json',
  ]);
});

test('should remove x-final-url header set by the proxy', async () => {
  expect(
    (await codeSampleResponse(
      har,
      new Response('', {
        headers: { 'x-final-url': 'http://example.com' },
      }),
    )).responseHeaders,
  ).toEqual([]);
});

test('should pass through status', async () => {
  const status = 200;
  expect((await codeSampleResponse(har, new Response('', { status }))).status).toEqual(status);
});

test('isBinary should be true if there is a content-disposition response header', async () => {
  const binaryHeaders = new Headers();
  binaryHeaders.set('Content-Disposition', 'attachment; filename="example.txt"');
  expect(
    (await codeSampleResponse(har, new Response('', { headers: binaryHeaders }))).isBinary,
  ).toEqual(true);
});

test('should parse json response', async () => {
  expect((await codeSampleResponse(har, response)).responseBody).toEqual(JSON.parse(responseBody));
});

test('should parse non-json response as text', async () => {
  const nonJsonResponseBody = '<xml-string />';
  const nonJsonResponse = new Response('<xml-string />', {
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  expect((await codeSampleResponse(har, nonJsonResponse)).responseBody).toEqual(
    nonJsonResponseBody,
  );
});

test('should not error if invalid json is returned', async () => {
  const invalidJsonResponse = new Response('plain text', {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  expect((await codeSampleResponse(har, invalidJsonResponse)).responseBody).toEqual('plain text');
});
