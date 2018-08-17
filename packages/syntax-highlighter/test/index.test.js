const syntaxHighlighter = require('../');

test('should highlight a block of code', () => {
  const code = syntaxHighlighter('var a = 1;', 'javascript');

  expect(code).toEqual(expect.stringMatching(/neo/));
  expect(code).toEqual(expect.stringMatching(/cm-s-neo/));
  expect(code).toBe('<span class="cm-s-neo"><span class="cm-keyword">var</span> <span class="cm-def">a</span> <span class="cm-operator">=</span> <span class="cm-number">1</span>;</span>');
});

test('should sanitize plain text language', () => {
  expect(syntaxHighlighter('& < > " \' /', 'text')).toBe('&amp; &lt; &gt; &quot; &#39; &#x2F;');
});

test('should sanitize mode', () => {
  expect(syntaxHighlighter('&', 'json')).toContain('&amp;');
  expect(syntaxHighlighter('<', 'json')).toContain('&lt;');
});

test('should concat the same style items', () => {
  // This is testing the `accum += text;` line
  expect(syntaxHighlighter('====', 'javascript')).toContain('====');
});


test('should work with modes', () => {
  expect(syntaxHighlighter('{ "a": 1 }', 'json')).toBe('<span class="cm-s-neo">{ <span class="cm-property">"a"</span>: <span class="cm-number">1</span> }</span>');
});

test('should have a dark theme', () => {
  expect(syntaxHighlighter('{ "a": 1 }', 'json', true)).toContain('<span class="cm-s-tomorrow-night">');
});

test('should work for modes with an array like java', () => {
  expect(syntaxHighlighter('service = client.service().messaging();', 'java')).toBe(
    '<span class="cm-s-neo"><span class="cm-variable">service</span> <span class="cm-operator">=</span> <span class="cm-variable">client</span>.<span class="cm-variable">service</span>().<span class="cm-variable">messaging</span>();</span>',
  );
});

test('should work for html', () => {
  expect(syntaxHighlighter('<p>test</p>', 'html')).toBe(
    '<span class="cm-s-neo"><span class="cm-tag cm-bracket">&lt;</span><span class="cm-tag">p</span><span class="cm-tag cm-bracket">></span>test<span class="cm-tag cm-bracket">&lt;/</span><span class="cm-tag">p</span><span class="cm-tag cm-bracket">></span></span>',
  );
});

test('should work for php without opening tag', () => {
  expect(syntaxHighlighter('echo "Hello World";', 'php')).toContain('cm-keyword');
});

test('should work for kotlin', () => {
  expect(syntaxHighlighter('println("$index: $element")', 'kotlin')).toContain('cm-variable');
});

test('should work for go', () => {
  expect(syntaxHighlighter('func main() {}', 'go')).toContain('cm-variable');
});
