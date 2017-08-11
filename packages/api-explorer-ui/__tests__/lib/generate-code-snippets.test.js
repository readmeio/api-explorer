const generateCodeSnippets = require('../../src/lib/generate-code-snippets');

test('should generate a HTML snippet for each lang', () => {
  const languages = ['node', 'curl'];

  const snippets = generateCodeSnippets({
    servers: [
      { url: 'http://example.com' },
    ],
  }, '/path', 'get', languages);

  expect(Object.keys(snippets)).toEqual(languages);

  Object.keys(snippets).forEach((lang) => {
    expect(typeof snippets[lang]).toBe('string');
    expect(snippets[lang]).toEqual(expect.stringMatching(/cm-s-tomorrow-night/));
  });
});
