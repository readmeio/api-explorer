const generateCodeSnippet = require('../../src/lib/generate-code-snippet');

test('should generate a HTML snippet for each lang', () => {
  const snippet = generateCodeSnippet(
    {
      servers: [{ url: 'http://example.com' }],
    },
    { path: '/path', method: 'get' },
    {},
    'node',
  );

  expect(typeof snippet).toBe('string');
  expect(snippet).toEqual(expect.stringMatching(/cm-s-tomorrow-night/));
});

test('should pass through values to code snippet', () => {
  const snippet = generateCodeSnippet(
    {
      servers: [{ url: 'http://example.com' }],
    },
    {
      path: '/path/{id}',
      method: 'get',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
        },
      ],
    },
    { path: { id: 123 } },
    'node',
  );

  expect(snippet).toEqual(expect.stringMatching('http://example.com/path/123'));
});
