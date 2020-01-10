const { shallow, mount } = require('enzyme');
const React = require('react');
const BaseUrlContext = require('../contexts/BaseUrl');

const markdown = require('../index');
const settings = require('../processor/options.json');

test('image', () => {
  expect(
    shallow(markdown.default('![Image](http://example.com/image.png)', settings)).html(),
  ).toMatchSnapshot();
});

test('list items', () => {
  expect(shallow(markdown.default('- listitem1', settings)).html()).toMatchSnapshot();
});

test('check list items', () => {
  expect(
    shallow(markdown.default('- [ ] checklistitem1\n- [x] checklistitem1', settings)).html(),
  ).toMatchSnapshot();
});

test('should strip out inputs', () => {
  expect(
    shallow(markdown.default('<input type="text" value="value" />', settings)).html(),
  ).toMatchSnapshot();
});

test('tables', () => {
  expect(
    shallow(
      markdown.default(`
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
      markdown.default(`
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
      markdown.default(`
[link](http://example.com)
[xss](javascript:alert)
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[changelog](changelog:slug)
[page](page:slug)
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('anchor target: should default to _self', () => {
  expect(
    shallow(markdown.default('[test](https://example.com)', settings)).html(),
  ).toMatchSnapshot();
});

test('anchor target: should allow _blank if using HTML', () => {
  expect(
    shallow(
      markdown.default('<a href="https://example.com" target="_blank">test</a>', settings),
    ).html(),
  ).toMatchSnapshot();
});

test('anchors with baseUrl', () => {
  const wrapper = mount(
    React.createElement(
      BaseUrlContext.Provider,
      {
        value: '/child/v1.0',
      },
      markdown.html(
        `
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[changelog](changelog:slug)
[page](page:slug)
  `,
      ),
    ),
  );
  expect(wrapper.html()).toMatchSnapshot();
});

test('emojis', () => {
  expect(
    shallow(
      markdown.default(`
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
      markdown.default(`
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
  expect(markdown.html('', settings)).toBeNull();
});

test('`correctnewlines` option', () => {
  expect(shallow(markdown.react('test\ntest\ntest', { correctnewlines: true })).html()).toBe(
    '<p>test\ntest\ntest</p>',
  );
  expect(shallow(markdown.react('test\ntest\ntest', { correctnewlines: false })).html()).toBe(
    '<p>test<br/>\ntest<br/>\ntest</p>',
  );
});

test.skip('variables', () => {
  expect(shallow(markdown.default(`<<apiKey>>`)).html()).toMatchSnapshot();
});

test.skip('glossary', () => {
  expect(shallow(markdown.default(`<<glossary:term>>`)).html()).toMatchSnapshot();
});

// TODO not sure if this needs to work or not?
// Isn't it a good thing to always strip HTML?
describe('`stripHtml` option', () => {
  it('should allow html by default', () => {
    expect(markdown.html('<p>Test</p>')).toBe('<p><p>Test</p></p>\n');
    expect(markdown.html('<p>Test</p>', { stripHtml: false })).toBe('<p><p>Test</p></p>\n');
  });

  it('should escape unknown tags', () => {
    expect(markdown.html('<unknown-tag>Test</unknown-tag>')).toBe(
      '<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>\n',
    );
  });

  it('should allow certain attributes', () => {
    expect(markdown.html('<p id="test">Test</p>')).toBe('<p><p id="test">Test</p></p>\n');
  });

  it('should strip unknown attributes', () => {
    expect(markdown.html('<p unknown="test">Test</p>')).toBe('<p><p>Test</p></p>\n');
  });

  it('should escape everything if `stripHtml=true`', () => {
    expect(markdown.html('<p>Test</p>', { stripHtml: true })).toBe(
      '<p>&lt;p&gt;Test&lt;/p&gt;</p>\n',
    );
  });
});

test('should strip dangerous iframe tag', () => {
  expect(
    shallow(
      markdown.react('<p><iframe src="javascript:alert(\'delta\')"></iframe></p>', settings),
    ).html(),
  ).toBe('<p></p>');
});

test('should strip dangerous img attributes', () => {
  expect(
    shallow(markdown.default('<img src="x" onerror="alert(\'charlie\')">', settings)).html(),
  ).toBe('<img src="x" alt="Image Alternate Text" height="auto" width="auto"/>\n<p> </p>');
});

describe('export multiple Markdown renderers', () => {
  const text = markdown.normalize(`# Hello World

  | Col. A  | Col. B  | Col. C  |
  |:-------:|:-------:|:-------:|
  | Cell A1 | Cell B1 | Cell C1 |
  | Cell A2 | Cell B2 | Cell C2 |
  | Cell A3 | Cell B3 | Cell C3 |

  [Embed Title](https://jsfiddle.net/rafegoldberg/5VA5j/ "@embed")

  > ❗️ UhOh
  >
  > Lorem ipsum dolor sit amet consectetur adipisicing elit.


  `);
  const tree = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: 'Hello World',
          },
        ],
      },
    ],
  };

  it('renders plain markdown as React', () => {
    expect(markdown.plain(text, settings)).toMatchSnapshot();
  });

  it('renders custom React components', () => {
    expect(markdown.react(text, settings)).toMatchSnapshot();
  });

  it('renders AST', () => {
    expect(markdown.ast(text, settings)).toMatchSnapshot();
  });

  it('renders MD', () => {
    expect(markdown.md(tree, settings)).toMatchSnapshot();
  });

  it('renders HTML', () => {
    expect(markdown.html(text, settings)).toMatchSnapshot();
  });
});
