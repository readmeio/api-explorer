const { shallow, mount } = require('enzyme');
const React = require('react');
const BaseUrlContext = require('../contexts/BaseUrl');

const markdown = require('../');
const settings = require('../processor/options.json');

test('image', () => {
  expect(
    shallow(markdown('![Image](http://example.com/image.png)', settings)).html(),
  ).toMatchSnapshot();
});

test('list items', () => {
  expect(shallow(markdown('- listitem1', settings)).html()).toMatchSnapshot();
});

test('check list items', () => {
  expect(
    shallow(markdown('- [ ] checklistitem1\n- [x] checklistitem1', settings)).html(),
  ).toMatchSnapshot();
});

test('should strip out inputs', () => {
  expect(
    shallow(markdown('<input type="text" value="value" />', settings)).html(),
  ).toMatchSnapshot();
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
[changelog](changelog:slug)
[page](page:slug)
  `),
    ).html(),
  ).toMatchSnapshot();
});

test('anchor target: should default to _self', () => {
  expect(shallow(markdown('[test](https://example.com)', settings)).html()).toMatchSnapshot();
});

test('anchor target: should allow _blank if using HTML', () => {
  expect(
    shallow(markdown('<a href="https://example.com" target="_blank">test</a>', settings)).html(),
  ).toMatchSnapshot();
});

test('anchors with baseUrl', () => {
  const wrapper = mount(
    React.createElement(
      BaseUrlContext.Provider,
      {
        value: '/child/v1.0',
      },
      markdown(
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
  expect(markdown('', settings)).toBe(null);
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
  it('should allow html by default', () => {
    expect(markdown('<p>Test</p>')).toBe('<p><p>Test</p></p>\n');
    expect(markdown('<p>Test</p>', { stripHtml: false })).toBe('<p><p>Test</p></p>\n');
  });

  it('should escape unknown tags', () => {
    expect(markdown('<unknown-tag>Test</unknown-tag>')).toBe(
      '<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>\n',
    );
  });

  it('should allow certain attributes', () => {
    expect(markdown('<p id="test">Test</p>')).toBe('<p><p id="test">Test</p></p>\n');
  });

  it('should strip unknown attributes', () => {
    expect(markdown('<p unknown="test">Test</p>')).toBe('<p><p>Test</p></p>\n');
  });

  it('should escape everything if `stripHtml=true`', () => {
    expect(markdown('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
  });
});

test('should strip dangerous iframe tag', () => {
  expect(
    shallow(
      markdown('<p><iframe src="javascript:alert(\'delta\')"></iframe></p>', settings),
    ).html(),
  ).toBe('<p></p>');
});

test('should strip dangerous img attributes', () => {
  expect(shallow(markdown('<img src="x" onerror="alert(\'charlie\')">', settings)).html()).toBe(
    '<img width="auto" height="auto" alt="Image Alternate Text" src="x"/>',
  );
});

describe.only('export multiple Markdown renderers', () => {
  const { react, plain, ast, md, html } = markdown;
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
  test.only('react', () => {
    expect(react(text, settings)).toMatchObject(xpct.react);
  });
  test('plain', () => {
    expect(plain(text, settings)).toMatchObject(xpct.plain);
  });
  test('ast', () => {
    expect(ast(text, settings)).toMatchObject(xpct.ast);
  });
  test('md', () => {
    expect(md(tree, settings)).toBe(xpct.md);
  });
  test('html', () => {
    expect(html(text, settings)).toBe(xpct.html);
  });
});
