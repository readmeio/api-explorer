const generateCodeSnippets = require('../../src/lib/generate-code-snippets');

test('should generate a HTML snippet for each lang', () => {
  const languages = ['node', 'curl'];

  const snippets = generateCodeSnippets({
    servers: [
      { url: 'http://example.com' },
    ],
  }, { path: '/path', method: 'get' }, {}, languages);

  expect(Object.keys(snippets)).toEqual(languages);

  Object.keys(snippets).forEach((lang) => {
    expect(typeof snippets[lang]).toBe('string');
    expect(snippets[lang]).toEqual(expect.stringMatching(/cm-s-tomorrow-night/));
  });
});

test('should pass through values to code snippet', () => {
  const snippets = generateCodeSnippets({
    servers: [
      { url: 'http://example.com' },
    ],
  }, {
    path: '/path/{id}',
    method: 'get',
    parameters: [
      {
        name: 'id',
        in: 'path',
        required: true,
      },
    ],
  }, { path: { id: 123 } }, ['node']);

  expect(snippets.node).toEqual(expect.stringMatching('http://example.com/path/123'));
});
