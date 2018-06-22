const fs = require('fs');
const markdown = require('../../src/lib/markdown');

const { shallow } = require('enzyme');

test('image', () => {
  expect(markdown('![Image](http://example.com/image.png)')).toMatchSnapshot();
});

test('list items', () => {
  expect(markdown('- listitem1')).toMatchSnapshot();
});

test('check list items', () => {
  expect(markdown('- [ ] checklistitem1')).toMatchSnapshot();
});

test('tables', () => {
  expect(markdown(`
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `)).toMatchSnapshot();
});

test('headings', () => {
  expect(markdown(`
# h1
## h2
### h3
  `)).toMatchSnapshot();
});

test('anchors', () => {
  expect(markdown(`
[link](http://example.com)
[xss](javascript:alert)
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[page](page:slug)
  `)).toMatchSnapshot();
});

test('emojis', () => {
  expect(markdown(`
:joy:
:fa-lock:
:unknown-emoji:
  `)).toMatchSnapshot();
});

test('code samples', () => {
  expect(markdown(`
\`\`\`js
var a = 1;
\`\`\`

\`\`\`
code-without-language
\`\`\`
  `)).toMatchSnapshot();
})

test('should render empty string if nothing passed in', () => {
  expect(markdown('')).toBe('');
});

test('`correctnewlines` option', () => {
  expect(markdown('test\ntest\ntest', { correctnewlines: true })).toBe('<p>test\ntest\ntest</p>\n');
  expect(markdown('test\ntest\ntest', { correctnewlines: false })).toBe(
    '<p>test<br>test<br>test</p>\n',
  );
});

describe('`stripHtml` option', () => {
  test('should allow html by default', () => {
    expect(markdown('<p>Test</p>')).toBe('<p><p>Test</p></p>\n');
    expect(markdown('<p>Test</p>', { stripHtml: false })).toBe('<p><p>Test</p></p>\n');
  });

  test('should escape unknown tags', () => {
    expect(markdown('<unknown-tag>Test</unknown-tag>')).toBe(
      '<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>\n',
    );
  });

  test('should allow certain attributes', () => {
    expect(markdown('<p id="test">Test</p>')).toBe('<p><p id="test">Test</p></p>\n');
  });

  test('should strip unknown attributes', () => {
    expect(markdown('<p unknown="test">Test</p>')).toBe('<p><p>Test</p></p>\n');
  });

  test('should escape everything if `stripHtml=true`', () => {
    expect(markdown('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
  });
});
