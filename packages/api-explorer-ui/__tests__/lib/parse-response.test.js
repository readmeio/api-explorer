const codeSampleResponse = require('../../src/lib/parse-response');
const statuscodes = require('../../src/lib/statuscodes');
const { Headers, Response } = require('node-fetch');

function createHar(har) {
  return {
    log: {
      entries: [{ request: har }],
    },
  };
}

const url = 'http://petstore.swagger.io/v2/pet';
const method = 'POST';

const har = createHar({
  headers: [
    {
      name: 'Authorization',
      value: 'Bearer api-key',
    },
  ],
  queryString: [],
  postData: {
    text: '{"category":{},"name":1,"photoUrls":[1]}',
  },
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

test('should pass through method', async () => {
  expect((await codeSampleResponse(har, response)).url).toBe(url);
});

test('should pass through URL', async () => {
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

test('should pass through status', async () => {
  const status = 200;
  expect((await codeSampleResponse(har, new Response('', { status }))).statusCode).toEqual(
    statuscodes(status),
  );
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
