const codeSampleResponse = require('../../src/lib/parse-response');
const statuscodes = require('../../src/lib/statuscodes');
const { Headers } = require('node-fetch');

function createHar(har) {
  return {
    log: {
      entries: [{ request: har }],
    },
  };
}

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
  method: 'POST',
  url: 'http://petstore.swagger.io/v2/pet',
});

const responseBody = {
  id: 9205436248879918000,
  category: { id: 0 },
  name: '1',
  photoUrls: ['1'],
  tags: [],
};

const headers = new Headers();
headers.set('Content-Type', 'application/json');
headers.set('x-custom-header', 'application/json');

test('should return result object', () => {
  const res = {
    type: 'cors',
    url: 'http://petstore.swagger.io/v2/pet',
    redirected: false,
    status: 200,
    ok: true,
    statusText: 'OK',
    headers,
  };

  expect(codeSampleResponse(res, responseBody, har)).toEqual({
    isBinary: false,
    method: 'POST',
    requestHeaders: ['Authorization: Bearer api-key'],
    responseHeaders: ['content-type: application/json', 'x-custom-header: application/json'],
    statusCode: [200, 'OK', 'success'],
    responseBody,
    url: 'http://petstore.swagger.io/v2/pet',
  });
});

test('should return array for request headers', () => {
  expect(
    codeSampleResponse(
      { headers },
      responseBody,
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
    ).requestHeaders,
  ).toEqual(['Authorization: Bearer api-key', 'Authorization1: Bearer api-key1']);
});

test('should return array for response headers', () => {
  expect(codeSampleResponse({ headers }, responseBody, har).responseHeaders).toEqual([
    'content-type: application/json',
    'x-custom-header: application/json',
  ]);
});

test('should default status to 404', () => {
  expect(
    codeSampleResponse(
      {
        headers,
      },
      responseBody,
      har,
    ).statusCode,
  ).toEqual(statuscodes(404));
});

test('isBinary should be true if there is a content-disposition response header', () => {
  const binaryHeaders = new Headers();
  binaryHeaders.set('Content-Disposition', 'attachment; filename="example.txt"');
  expect(codeSampleResponse({ headers: binaryHeaders }, responseBody, har).isBinary).toEqual(true);
});
