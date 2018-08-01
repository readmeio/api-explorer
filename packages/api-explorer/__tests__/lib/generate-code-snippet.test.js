const { shallow } = require('enzyme');
const extensions = require('@readme/oas-extensions');
const generateCodeSnippet = require('../../src/lib/generate-code-snippet');

const { getLangName } = generateCodeSnippet;

const oas = {
  servers: [{ url: 'http://example.com' }],
};

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

test('should generate a HTML snippet for each lang', () => {
  const snippet = shallow(generateCodeSnippet(oas, operation, {}, 'node'));

  expect(snippet.hasClass('cm-s-tomorrow-night')).toEqual(true);
});

test('should pass through values to code snippet', () => {
  const snippet = shallow(generateCodeSnippet(oas, operation, values, 'node'));

  expect(snippet.text()).toEqual(expect.stringMatching('http://example.com/path/123'));
});

test('should not contain proxy url', () => {
  const snippet = shallow(generateCodeSnippet(
    Object.assign({}, oas, { [extensions.PROXY_ENABLED]: true }),
    operation,
    values,
    'node',
  ));

  expect(snippet.text()).toEqual(expect.stringMatching('http://example.com/path/123'));
});

test('javascript should not contain `withCredentials`', () => {
  const snippet = shallow(generateCodeSnippet(oas, operation, {}, 'javascript'));

  expect(snippet.text()).not.toMatch(/withCredentials/);
});

describe('#getLangName()', () => {
  it('should convert name to correct case', () => {
    expect(getLangName('go')).toBe('Go');
  });

  it('should pass through unknown values', () => {
    expect(getLangName('HTTP')).toBe('HTTP');
  });
});
