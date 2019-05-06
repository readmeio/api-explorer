const { shallow } = require('enzyme');
const extensions = require('@mia-platform/oas-extensions');
const generateCodeSnippet = require('../../src/lib/generate-code-snippet');
const Oas = require('../../src/lib/Oas');

const { getLangName } = generateCodeSnippet;

const oas = new Oas();

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

const values = { path: { id: 123 } };

test('should return falsy values for an unknown language', () => {
  const codeSnippet = generateCodeSnippet(oas, operation, {}, {}, 'css');

  expect(codeSnippet.snippet).toBe(false);
  expect(codeSnippet.code).toBe('');
});

test('should generate a HTML snippet for each lang', () => {
  const { snippet } = generateCodeSnippet(oas, operation, {}, {}, 'node');

  expect(shallow(snippet).hasClass('cm-s-tomorrow-night')).toEqual(true);
});

test('should pass through values to code snippet', () => {
  const { snippet } = generateCodeSnippet(oas, operation, values, {}, 'node');

  expect(shallow(snippet).text()).toEqual(expect.stringMatching('https://example.com/path/123'));
});

test('should not contain proxy url', () => {
  const { snippet } = generateCodeSnippet(
    new Oas({ [extensions.PROXY_ENABLED]: true }),
    operation,
    values,
    {},
    'node',
  );

  expect(shallow(snippet).text()).toEqual(expect.stringMatching('https://example.com/path/123'));
});

test('javascript should not contain `withCredentials`', () => {
  const { snippet } = generateCodeSnippet(oas, operation, {}, {}, 'javascript');

  expect(shallow(snippet).text()).not.toMatch(/withCredentials/);
});

test('should return with unhighlighted code', () => {
  const { code } = generateCodeSnippet(oas, operation, {}, {}, 'javascript');

  expect(code).not.toMatch(/cm-s-tomorrow-night/);
});

describe('#getLangName()', () => {
  it('should convert name to correct case', () => {
    expect(getLangName('go')).toBe('Go');
  });

  it('should pass through unknown values', () => {
    expect(getLangName('HTTP')).toBe('HTTP');
  });
});
