const { shallow } = require('enzyme');

const markdown = require('../');

test('image', () => {
  expect(shallow(markdown('![Image](http://example.com/image.png)')).html()).toMatchSnapshot();
});

test('list items', () => {
  expect(shallow(markdown('- listitem1')).html()).toMatchSnapshot();
});

test('check list items', () => {
  expect(shallow(markdown('- [ ] checklistitem1\n- [x] checklistitem1')).html()).toMatchSnapshot();
});

test('should strip out inputs', () => {
  expect(shallow(markdown('<input type="text" value="value" />')).html()).toMatchSnapshot();
});

test('tables', () => {
  expect(
    shallow(
      markdown(`
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('headings', () => {
  expect(
    shallow(
      markdown(`
# h1
## h2
### h3
#### h4
##### h5
###### h6
# \`code\`
# heading with some more CONTENT
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('anchors', () => {
  expect(
    shallow(
      markdown(`
[link](http://example.com)
[xss](javascript:alert)
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[page](page:slug)
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('emojis', () => {
  expect(
    shallow(
      markdown(`
:joy:
:fa-lock:
:unknown-emoji:
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('code samples', () => {
  expect(
    shallow(
      markdown(`
\`\`\`javascript
var a = 1;
\`\`\`

\`\`\`
code-without-language
\`\`\`
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('should render nothing if nothing passed in', () => {
  expect(markdown('')).toBe(null);
});

test('should parse newline character', () => {
  expect(
    shallow(markdown('test\ntest\ntest'))
      .html()
      .includes('\n'),
  ).toBe(true);
});

test('variables', () => {
  expect(shallow(markdown(`<<apiKey>>`)).html()).toMatchSnapshot();
});

test('glossary', () => {
  expect(shallow(markdown(`<<glossary:term>>`)).html()).toMatchSnapshot();
});

test('should escape unknown tags', () => {
  expect(shallow(markdown('<unknown-tag>Test</unknown-tag>')).html()).toBe('<p>Test</p>');
});

test('should allow certain attributes', () => {
  expect(shallow(markdown('<p id="test">Test</p>')).html()).toBe(
    '<p id="user-content-test">Test</p>',
  );
});

test('should strip unknown attributes', () => {
  expect(shallow(markdown('<p unknown="test">Test</p>')).html()).toBe('<p>Test</p>');
});

test('should strip dangerous href', () => {
  expect(shallow(markdown('<a href="jAva script:alert(\'bravo\')">delta</a>')).html()).toBe(
    '<p><a href="" target="_self">delta</a></p>',
  );
});

test('should strip dangerous iframe tag', () => {
  expect(
    shallow(markdown('<p><iframe src="javascript:alert(\'delta\')"></iframe></p>')).html(),
  ).toBe('<p></p>');
});

test('should strip dangerous img attributes', () => {
  expect(shallow(markdown('<img src="x" onerror="alert(\'charlie\')">')).html()).toBe(
    '<img src="x"/>',
  );
});
