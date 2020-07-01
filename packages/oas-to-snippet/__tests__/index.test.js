const extensions = require('@readme/oas-extensions');
const Oas = require('@readme/oas-tooling');
const petstore = require('@readme/oas-examples/3.0/json/petstore.json');

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

  expect(code).toStrictEqual(expect.stringMatching("body: {id: '123'}"));
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

  expect(code).toStrictEqual(expect.stringMatching("form: {id: '123'}"));
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

test('javascript should not contain `withCredentials`', () => {
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
    petstoreOas.operation('/pets', 'get'),
    {
      query: { limit: 10 },
    },
    {},
    'node-simple',
    oasUrl
  );

  expect(snippet.code).toStrictEqual(expect.stringMatching('https://example.com/openapi.json'));
  expect(snippet.highlightMode).toBe('javascript');
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
