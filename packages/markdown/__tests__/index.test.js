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

test('anchors with baseUrl', () => {
  const opts = { baseUrl: '/child/v1.0' };
  expect(
    shallow(
      markdown(
        `
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[page](page:slug)
  `,
        opts,
      ),
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

test('`correctnewlines` option', () => {
  expect(shallow(markdown('test\ntest\ntest', { correctnewlines: true })).html()).toBe(
    '<p>test\ntest\ntest</p>',
  );
  expect(shallow(markdown('test\ntest\ntest', { correctnewlines: false })).html()).toBe(
    '<p>test<br/>\ntest<br/>\ntest</p>',
  );
});

test('variables', () => {
  expect(shallow(markdown(`<<apiKey>>`)).html()).toMatchSnapshot();
});

test('glossary', () => {
  expect(shallow(markdown(`<<glossary:term>>`)).html()).toMatchSnapshot();
});

// TODO not sure if this needs to work or not?
// Isn't it a good thing to always strip HTML?
describe.skip('`stripHtml` option', () => {
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
