const { mount, shallow } = require('enzyme');
const syntaxHighlighter = require('../');

test('should highlight a block of code', () => {
  const code = shallow(syntaxHighlighter('var a = 1;', 'javascript'));

  expect(code.hasClass('cm-s-neo')).toEqual(true);
  expect(code.html()).toBe(
    '<span class="cm-s-neo"><span class="cm-keyword">var</span> <span class="cm-def">a</span> <span class="cm-operator">=</span> <span class="cm-number">1</span>;</span>',
  );
});

test('should sanitize plain text language', () => {
  expect(shallow(syntaxHighlighter('& < > " \' /', 'text')).html()).toContain(
    '&amp; &lt; &gt; &quot; &#x27; /',
  );
});

test('should sanitize mode', () => {
  expect(shallow(syntaxHighlighter('&', 'json')).html()).toContain('&amp;');
  expect(shallow(syntaxHighlighter('<', 'json')).html()).toContain('&lt;');
});

test('should concat the same style items', () => {
  // This is testing the `accum += text;` line
  expect(shallow(syntaxHighlighter('====', 'javascript')).text()).toContain('====');
});

test('should work with modes', () => {
  expect(shallow(syntaxHighlighter('{ "a": 1 }', 'json')).html()).toBe(
    '<span class="cm-s-neo">{ <span class="cm-property">&quot;a&quot;</span>: <span class="cm-number">1</span> }</span>',
  );
});

test('should have a dark theme', () => {
  expect(
    shallow(syntaxHighlighter('{ "a": 1 }', 'json', { dark: true })).hasClass(
      'cm-s-tomorrow-night',
    ),
  ).toEqual(true);
});

test('should tokenize variables (double quotes)', () => {
  expect(
    mount(syntaxHighlighter('"<<apiKey>>"', 'json', { tokenizeVariables: true })).find('Variable')
      .length,
  ).toEqual(1);
});

test('should tokenize variables (single quotes)', () => {
  expect(
    mount(syntaxHighlighter("'<<apiKey>>'", 'json', { tokenizeVariables: true })).find('Variable')
      .length,
  ).toEqual(1);
});

test('should keep enclosing characters around the variable', () => {
  expect(
    mount(syntaxHighlighter("'<<apiKey>>'", 'json', { tokenizeVariables: true })).text(),
  ).toEqual("'APIKEY'");
});

test('should work for modes with an array like java', () => {
  expect(shallow(syntaxHighlighter('service = client.service().messaging();', 'java')).html()).toBe(
    '<span class="cm-s-neo"><span class="cm-variable">service</span> <span class="cm-operator">=</span> <span class="cm-variable">client</span>.<span class="cm-variable">service</span>().<span class="cm-variable">messaging</span>();</span>',
  );
});

test('should work for html', () => {
  expect(shallow(syntaxHighlighter('<p>test</p>', 'html')).html()).toBe(
    '<span class="cm-s-neo"><span class="cm-tag cm-bracket">&lt;</span><span class="cm-tag">p</span><span class="cm-tag cm-bracket">&gt;</span>test<span class="cm-tag cm-bracket">&lt;/</span><span class="cm-tag">p</span><span class="cm-tag cm-bracket">&gt;</span></span>',
  );
});

test('should work for php without opening tag', () => {
  expect(shallow(syntaxHighlighter('echo "Hello World";', 'php')).html()).toContain('cm-keyword');
});

test('should work for kotlin', () => {
  expect(shallow(syntaxHighlighter('println("$index: $element")', 'kotlin')).html()).toContain(
    'cm-variable',
  );
});

test('should work for go', () => {
  expect(shallow(syntaxHighlighter('func main() {}', 'go')).html()).toContain('cm-variable');
});

test('should work for typescript', () => {
  expect(
    shallow(syntaxHighlighter('let { a, b }: { a: string, b: number } = o;', 'typescript')).html(),
  ).toContain('cm-variable');
});

test('should work for swift', () => {
  expect(shallow(syntaxHighlighter('var x = 0;', 'swift')).html()).toContain('cm-def');
});
