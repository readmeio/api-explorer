const markdown = require('../../src/lib/markdown');

const { shallow } = require('enzyme');

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
  expect(shallow(markdown(`
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `)).html()).toMatchSnapshot();
});

test('headings', () => {
  expect(shallow(markdown(`
# h1
## h2
### h3
#### h4
##### h5
###### h6
# heading with some more CONTENT
  `)).html()).toMatchSnapshot();
});

test('anchors', () => {
  expect(shallow(markdown(`
[link](http://example.com)
[xss](javascript:alert)
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[page](page:slug)
  `)).html()).toMatchSnapshot();
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
  expect(shallow(markdown('test\ntest\ntest', { correctnewlines: true })).html()).toBe('<div><p>test\ntest\ntest</p></div>');
  expect(shallow(markdown('test\ntest\ntest', { correctnewlines: false })).html()).toBe(
    '<div><p>test<br/>\ntest<br/>\ntest</p></div>',
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
