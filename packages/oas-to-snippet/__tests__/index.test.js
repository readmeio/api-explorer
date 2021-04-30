const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');
const path = require('path');
const datauri = require('datauri');
const harExamples = require('har-examples');

const generateCodeSnippet = require('../src');
const supportedLanguages = require('../src/supportedLanguages');

const { getLangName } = generateCodeSnippet;

const oas = new Oas();
const petstoreOas = new Oas(petstore);

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

test('should be able to accept a har override', () => {
  const codeSnippet = generateCodeSnippet(null, null, null, null, 'node', null, harExamples.full);
  expect(codeSnippet).toMatchSnapshot();
});

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

test('should not double-encode query strings', () => {
  const startTime = '2019-06-13T19:08:25.455Z';
  const endTime = '2015-09-15T14:00:12-04:00';

  const snippet = generateCodeSnippet(
    oas,
    {
      path: '/',
      method: 'get',
      parameters: [
        {
          explode: true,
          in: 'query',
          name: 'startTime',
          schema: {
            type: 'string',
          },
          style: 'form',
        },
        {
          explode: true,
          in: 'query',
          name: 'endTime',
          schema: {
            type: 'string',
          },
          style: 'form',
        },
      ],
    },
    { query: { startTime, endTime } },
    {},
    'javascript',
    oasUrl
  );

  expect(snippet.code).toContain(encodeURIComponent(startTime));
  expect(snippet.code).toContain(encodeURIComponent(endTime));
  expect(snippet.code).not.toContain(encodeURIComponent(encodeURIComponent(startTime)));
  expect(snippet.code).not.toContain(encodeURIComponent(encodeURIComponent(endTime)));
});

describe('supported languages', () => {
  const languages = Object.keys(supportedLanguages).map(lang => [lang]);

  describe.each(languages)('%s', lang => {
    const targets = Object.keys(supportedLanguages[lang].httpsnippet.targets);

    it('should have a language definition', () => {
      expect(supportedLanguages[lang]).toMatchObject({
        highlight: expect.any(String),
        httpsnippet: {
          lang: expect.any(String),
          default: expect.any(String),
          targets: expect.any(Object),
        },
      });

      expect(targets.length).toBeGreaterThanOrEqual(1);
      expect(targets).toContain(supportedLanguages[lang].httpsnippet.default);

      targets.forEach(target => {
        if ('opts' in supportedLanguages[lang].httpsnippet.targets[target]) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(supportedLanguages[lang].httpsnippet.targets[target].opts).toStrictEqual(expect.any(Object));
        }

        if ('install' in supportedLanguages[lang].httpsnippet.targets[target]) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(supportedLanguages[lang].httpsnippet.targets[target].install).toStrictEqual(expect.any(String));
        }
      });
    });

    it('should generate code for the default target', () => {
      const snippet = generateCodeSnippet(oas, operation, formData, {}, lang);
      expect(snippet).toMatchSnapshot();
    });

    describe('targets', () => {
      it.each(targets.map(target => [target]))('%s', target => {
        const snippet = generateCodeSnippet(
          petstoreOas,
          petstoreOas.operation('/user/login', 'get'),
          {
            query: { username: 'woof', password: 'barkbarkbark' },
          },
          {},
          [lang, target],
          oasUrl
        );

        expect(snippet).toMatchSnapshot();
      });
    });
  });

  it('should support `node-simple`', () => {
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
});

describe('#getLangName()', () => {
  it('should convert name to correct case', () => {
    expect(getLangName('c')).toBe('C');
    expect(getLangName('cplusplus')).toBe('C++');
    expect(getLangName('csharp')).toBe('C#');
    expect(getLangName('clojure')).toBe('Clojure');
    expect(getLangName('curl')).toBe('cURL');
    expect(getLangName('go')).toBe('Go');
    expect(getLangName('java')).toBe('Java');
    expect(getLangName('javascript')).toBe('JavaScript');
    expect(getLangName('kotlin')).toBe('Kotlin');
    expect(getLangName('node')).toBe('Node');
    expect(getLangName('node-simple')).toBe('Node (simple)');
    expect(getLangName('objectivec')).toBe('Objective-C');
    expect(getLangName('ocaml')).toBe('OCaml');
    expect(getLangName('php')).toBe('PHP');
    expect(getLangName('powershell')).toBe('PowerShell');
    expect(getLangName('python')).toBe('Python');
    expect(getLangName('r')).toBe('R');
    expect(getLangName('ruby')).toBe('Ruby');
    expect(getLangName('swift')).toBe('Swift');
  });

  it('should pass through unknown values', () => {
    expect(getLangName('HTTP')).toBe('HTTP');
    expect(getLangName('unknown')).toBe('unknown');
  });
});
