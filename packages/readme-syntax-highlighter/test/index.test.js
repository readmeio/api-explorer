const syntaxHighlighter = require('../');

test('should highlight a block of code', () => {
  const code = syntaxHighlighter('var a = 1;', 'javascript');

  expect(code).toEqual(expect.stringMatching(/tomorrow-night/));
  expect(code).toEqual(expect.stringMatching(/cm-s-tomorrow-night/));
  expect(code).toBe('<span class="cm-s-tomorrow-night"><span class="cm-keyword">var</span> <span class="cm-def">a</span> <span class="cm-operator">=</span> <span class="cm-number">1</span>;</span>');
});

test('should sanitize plain text language', () => {
  expect(syntaxHighlighter('& < > " \' /', 'text')).toBe('&amp; &lt; &gt; &quot; &#39; &#x2F;');
});
