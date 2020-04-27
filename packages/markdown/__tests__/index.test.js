const { mount } = require('enzyme');
const React = require('react');
const cheerio = require('cheerio');
const BaseUrlContext = require('../contexts/BaseUrl');

const markdown = require('../index');
const settings = require('../options.json');

test('image', () => {
  expect(mount(markdown.default('![Image](http://example.com/image.png)')).html()).toMatchSnapshot();
});

test('magic image', () => {
  expect(
    mount(
      markdown.default(
        `
    [block:image]
    {
      "images": [
        {
          "image": [
            "https://files.readme.io/6f52e22-man-eating-pizza-and-making-an-ok-gesture.jpg",
            "man-eating-pizza-and-making-an-ok-gesture.jpg",
            1024,
            682,
            "#d1c8c5"
          ],
          "caption": "A guy. Eating pizza. And making an OK gesture.",
          "sizing": "full"
        }
      ]
    }
    [/block]
    `,
        settings
      )
    ).html()
  ).toMatchSnapshot();
});

test('list items', () => {
  expect(mount(markdown.default('- listitem1')).html()).toMatchSnapshot();
});

test('check list items', () => {
  expect(mount(markdown.default('- [ ] checklistitem1\n- [x] checklistitem1')).html()).toMatchSnapshot();
});

test('should strip out inputs', () => {
  const wrap = mount(markdown.default('<input type="text" value="value" />'));
  expect(wrap.exists()).toBe(false);
});

test('tables', () => {
  const wrap = mount(
    markdown.default(`| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
  `)
  );
  expect(wrap.find('Table').html()).toMatchSnapshot();
});

test('headings', () => {
  const wrap = mount(
    markdown.default(`# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6`)
  );
  expect(wrap.find('Heading')).toHaveLength(6);
});

test('anchors', () => {
  expect(
    mount(
      markdown.default(`
[link](http://example.com)
[xss](javascript:alert)
[doc](doc:slug)
[ref](ref:slug)
[blog](blog:slug)
[changelog](changelog:slug)
[page](page:slug)
  `)
    ).html()
  ).toMatchSnapshot();
});

test('anchor target: should default to _self', () => {
  expect(mount(markdown.default('[test](https://example.com)')).html()).toMatchSnapshot();
});

test('anchor target: should allow _blank if using HTML', () => {
  expect(mount(markdown.default('<a href="https://example.com" target="_blank">test</a>')).html()).toMatchSnapshot();
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
  `
      )
    )
  );
  expect(wrapper.html()).toMatchSnapshot();
});

test('emojis', () => {
  expect(
    mount(
      markdown.default(`
:joy:
:fa-lock:
:unknown-emoji:
  `)
    ).html()
  ).toMatchSnapshot();
});

test('code samples', () => {
  const wrap = mount(
    markdown.default(`
\`\`\`javascript
var a = 1;
\`\`\`

\`\`\`
code-without-language
\`\`\`
`)
  );
  expect(wrap.find('pre')).toHaveLength(2);
});

test('should render nothing if nothing passed in', () => {
  expect(markdown.html('')).toBeNull();
});

test('`correctnewlines` option', () => {
  expect(mount(markdown.react('test\ntest\ntest', { correctnewlines: true })).html()).toBe('<p>test\ntest\ntest</p>');
  expect(mount(markdown.react('test\ntest\ntest', { correctnewlines: false })).html()).toBe(
    '<p>test<br>\ntest<br>\ntest</p>'
  );
});

// TODO not sure if this needs to work or not?
// Isn't it a good thing to always strip HTML?
describe('`stripHtml` option', () => {
  it('should allow html by default', () => {
    expect(markdown.html('<p>Test</p>')).toBe('<p>Test</p>');
    expect(markdown.html('<p>Test</p>', { stripHtml: false })).toBe('<p>Test</p>');
  });

  it.skip('should escape unknown tags', () => {
    expect(markdown.html('<unknown-tag>Test</unknown-tag>')).toBe('<p>&lt;unknown-tag&gt;Test&lt;/unknown-tag&gt;</p>');
  });

  it('should allow certain attributes', () => {
    expect(markdown.html('<p id="test">Test</p>')).toBe('<p id="test">Test</p>');
  });

  it('should strip unknown attributes', () => {
    expect(markdown.html('<p unknown="test">Test</p>')).toBe('<p>Test</p>');
  });

  it.skip('should escape everything if `stripHtml=true`', () => {
    expect(markdown.html('<p>Test</p>', { stripHtml: true })).toBe('<p>&lt;p&gt;Test&lt;/p&gt;</p>\n');
  });
});

test('should strip dangerous iframe tag', () => {
  expect(mount(markdown.react('<p><iframe src="javascript:alert(\'delta\')"></iframe></p>')).html()).toBe('<p></p>');
});

test('should strip dangerous img attributes', () => {
  expect(mount(markdown.default('<img src="x" onerror="alert(\'charlie\')">')).html()).toBe(
    '<img src="x" align="" alt="" caption="" height="auto" title="" width="auto" loading="lazy">'
  );
});

describe('export multiple Markdown renderers', () => {
  const text = `# Hello World

  | Col. A  | Col. B  | Col. C  |
  |:-------:|:-------:|:-------:|
  | Cell A1 | Cell B1 | Cell C1 |
  | Cell A2 | Cell B2 | Cell C2 |
  | Cell A3 | Cell B3 | Cell C3 |

  [Embed Title](https://jsfiddle.net/rafegoldberg/5VA5j/ "@embed")

  > ❗️ UhOh
  >
  > Lorem ipsum dolor sit amet consectetur adipisicing elit.


  `;
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
    expect(markdown.plain(text)).toMatchSnapshot();
  });

  it('renders custom React components', () => {
    expect(markdown.react(text)).toMatchSnapshot();
  });

  it('renders hAST', () => {
    expect(markdown.hast(text)).toMatchSnapshot();
  });

  it('renders mdAST', () => {
    expect(markdown.mdast(text)).toMatchSnapshot();
  });

  it('renders MD', () => {
    expect(markdown.md(tree)).toMatchSnapshot();
  });

  it('allows complex compact headings', () => {
    const mdxt = `#Basic Text

##🙀 oh noes!
###**6**. Oh No

Lorem ipsum dolor!`;
    const html = markdown.html(mdxt);
    expect(html).toMatchSnapshot();
  });

  it('renders HTML', () => {
    expect(markdown.html(text)).toMatchSnapshot();
  });

  it('returns null for blank input', () => {
    expect(markdown.html('')).toBeNull();
    expect(markdown.plain('')).toBeNull();
    expect(markdown.react('')).toBeNull();
    expect(markdown.hast('')).toBeNull();
    expect(markdown.mdast('')).toBeNull();
    expect(markdown.md('')).toBeNull();
  });
});

describe('prefix anchors with section-', () => {
  it('should add a section- prefix to heading anchors', () => {
    expect(markdown.html('# heading')).toMatchSnapshot();
  });
});
