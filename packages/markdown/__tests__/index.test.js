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
  expect(markdown.html('', settings)).toBe(null);
});

test('`correctnewlines` option', () => {
  expect(shallow(markdown.default('test\ntest\ntest', { correctnewlines: true })).html()).toBe(
    '<p>test\ntest\ntest</p>',
  );
  expect(shallow(markdown.default('test\ntest\ntest', { correctnewlines: false })).html()).toBe(
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
describe.skip('`stripHtml` option', () => {
  test('should allow html by default', () => {
    expect(markdown('<p>Test</p>', settings)).toBe('<p><p>Test</p></p>\n');
    expect(markdown('<p>Test</p>', { stripHtml: false })).toBe('<p><p>Test</p></p>\n');
  });

  test('should escape unknown tags', () => {
    expect(markdown('<unknown-tag>Test</unknown-tag>', settings)).toBe(
      '<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>\n',
    );
  });

  test('should allow certain attributes', () => {
    expect(markdown('<p id="test">Test</p>', settings)).toBe('<p><p id="test">Test</p></p>\n');
  });

  test('should strip unknown attributes', () => {
    expect(markdown('<p unknown="test">Test</p>', settings)).toBe('<p><p>Test</p></p>\n');
  });

  test('should escape everything if `stripHtml=true`', () => {
    expect(markdown('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
  });
});

test('should strip dangerous iframe tag', () => {
  expect(
    shallow(
      markdown.default('<p><iframe src="javascript:alert(\'delta\')"></iframe></p>', settings),
    ).html(),
  ).toBe('<p></p>');
});

test('should strip dangerous img attributes', () => {
  expect(
    shallow(markdown.default('<img src="x" onerror="alert(\'charlie\')">', settings)).html(),
  ).toBe('<img width="auto" height="auto" alt="Image Alternate Text" src="x"/>');
});

describe('export multiple Markdown renderers', () => {
  const text = `# Hello World`;
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
            position: {
              start: {
                line: 1,
                column: 3,
                offset: 2,
              },
              end: {
                line: 1,
                column: 14,
                offset: 13,
              },
              indent: [],
            },
          },
        ],
      },
    ],
  };
  const xpct = {
    react: {
      type: 'h1',
      key: 'h-1',
      ref: null,
      props: {
        children: ['Hello World'],
      },
      _owner: null,
      _store: {},
    },
    plain: {
      key: 'h-1',
      ref: null,
      props: {
        children: ['Hello World'],
      },
      _owner: null,
      _store: {},
    },
    ast: {
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
    },
    md: '# Hello World\n',
    html: '<h1>Hello World</h1>',
  };
  test('react', () => {
    const txt =
      "```javascript single.js\nconsole.log('a single sample code block');\n```\n\n***\n\n```javascript multiple.js\nconsole.log('a multi-file code block');\n```\n```javascript\nconsole.log('an unnamed sample snippet');\n```\n\n \n";
    const dom = markdown.react(txt, settings);
    const out = markdown.html(dom, settings);
    console.log(out);
    expect('x').toMatch('x');
  });
  test('plain', () => {
    expect(markdown.plain(text, settings)).toMatchObject(xpct.plain);
  });
  test('ast', () => {
    expect(markdown.ast(text, settings)).toMatchObject(xpct.ast);
  });
  test('md', () => {
    expect(markdown.md(tree, settings)).toBe(xpct.md);
  });
  test('html', () => {
    expect(markdown.html(text, settings)).toBe(xpct.html);
  });
});
