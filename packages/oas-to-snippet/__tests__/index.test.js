const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');
const path = require('path');
const datauri = require('datauri');

const generateCodeSnippet = require('../src');

const { getLangName } = generateCodeSnippet;

const oas = new Oas();

const oasUrl = 'https://example.com/openapi.json';
const operation = {
  path: '/path/{id}',
  method: 'get',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
    },
  ],
};

const formData = { path: { id: 123 } };

test('should return falsy values for an unknown language', () => {
  const codeSnippet = generateCodeSnippet(oas, operation, {}, {}, 'css', oasUrl);

  expect(codeSnippet).toStrictEqual({
    code: '',
    highlightMode: false,
  });
});

test('should pass through values to code snippet', () => {
  const { code } = generateCodeSnippet(oas, operation, formData, {}, 'node', oasUrl);

  expect(code).toStrictEqual(expect.stringMatching('https://example.com/path/123'));
});

test('should pass through json values to code snippet', () => {
  const { code } = generateCodeSnippet(
    oas,
    {
      path: '/path',
      method: 'post',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    { body: { id: '123' } },
    {},
    'node',
    oasUrl
  );

  expect(code).toMatch("body: JSON.stringify({id: '123'}");
});

test('should pass through form encoded values to code snippet', () => {
  const { code } = generateCodeSnippet(
    oas,
    {
      path: '/path',
      method: 'post',
      requestBody: {
        content: {
          'application/x-www-form-urlencoded': {
            schema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    { formData: { id: '123' } },
    {},
    'node',
    oasUrl
  );

  expect(code).toMatch("encodedParams.set('id', '123');");
  expect(code).toMatch('body: encodedParams');
});

test('should not contain proxy url', () => {
  const { code } = generateCodeSnippet(
    new Oas({ [extensions.PROXY_ENABLED]: true }),
    operation,
    formData,
    {},
    'node',
    oasUrl
  );

  expect(code).toStrictEqual(expect.stringMatching('https://example.com/path/123'));
});

test('should not contain `withCredentials` in javascript snippets', () => {
  const { code } = generateCodeSnippet(oas, operation, {}, {}, 'javascript', oasUrl);

  expect(code).not.toMatch(/withCredentials/);
});

test('should return with unhighlighted code', () => {
  const { code } = generateCodeSnippet(oas, operation, {}, {}, 'javascript', oasUrl);

  expect(code).not.toMatch(/cm-s-tomorrow-night/);
});

test('should support node-simple', () => {
  const petstoreOas = new Oas(petstore);
  const snippet = generateCodeSnippet(
    petstoreOas,
    petstoreOas.operation('/user/login', 'get'),
    {
      query: { username: 'woof', password: 'barkbarkbark' },
    },
    {},
    'node-simple',
    oasUrl
  );

  expect(snippet.code).toStrictEqual(expect.stringMatching('https://example.com/openapi.json'));
  expect(snippet.highlightMode).toBe('javascript');
});

describe('multipart/form-data handlings', () => {
  let formDataOas;
  let owlbert;

  beforeAll(async () => {
    formDataOas = new Oas({
      servers: [{ url: 'https://example.com' }],
      paths: {
        '/multipart': {
          post: {
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
          },
        },
      },
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

    owlbert = await datauri(path.join(__dirname, '__fixtures__', 'owlbert.png'));

    // Doing this manually for now until when/if https://github.com/data-uri/datauri/pull/29 is accepted.
    owlbert = owlbert.replace(';base64', `;name=${encodeURIComponent('owlbert.png')};base64`);
  });

  it('should convert a multipart/form-data operation into a proper snippet that uses the original file', () => {
    const snippet = generateCodeSnippet(
      formDataOas,
      formDataOas.operation('/multipart', 'post'),
      {
        body: { orderId: 10, userId: 3232, documentFile: owlbert },
      },
      {},
      'curl',
      oasUrl
    );

    expect(snippet).toMatchSnapshot();
  });
});

describe('#getLangName()', () => {
  it('should convert name to correct case', () => {
    expect(getLangName('c')).toBe('C');
    expect(getLangName('cplusplus')).toBe('C++');
    expect(getLangName('csharp')).toBe('C#');
    expect(getLangName('curl')).toBe('cURL');
    expect(getLangName('go')).toBe('Go');
    expect(getLangName('java')).toBe('Java');
    expect(getLangName('javascript')).toBe('JavaScript');
    expect(getLangName('kotlin')).toBe('Kotlin');
    expect(getLangName('node')).toBe('Node');
    expect(getLangName('node-simple')).toBe('Node (simple)');
    expect(getLangName('objectivec')).toBe('Objective-C');
    expect(getLangName('php')).toBe('PHP');
    expect(getLangName('powershell')).toBe('PowerShell');
    expect(getLangName('python')).toBe('Python');
    expect(getLangName('ruby')).toBe('Ruby');
    expect(getLangName('swift')).toBe('Swift');
  });

  it('should pass through unknown values', () => {
    expect(getLangName('HTTP')).toBe('HTTP');
    expect(getLangName('unknown')).toBe('unknown');
  });
});
