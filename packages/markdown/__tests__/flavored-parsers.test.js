const unified = require('unified');
const remarkParse = require('remark-parse');
const rehypeSanitize = require('rehype-sanitize');

const parseCallouts = require('../processor/parse/flavored/callout');
const parseCodeTabs = require('../processor/parse/flavored/code-tabs');
const options = require('../options.json').markdownOptions;

const sanitize = { attributes: [], tagNames: [] };
const process = (text, opts = options) =>
  text &&
  unified()
    .use(remarkParse, opts)
    .data('settings', { position: false })
    .use([parseCallouts.sanitize(sanitize), parseCodeTabs.sanitize(sanitize)])
    .use(rehypeSanitize)
    .parse(text);

describe('Parse ReadMe-Flavored Markdown Syntax', () => {
  it('Callouts', () => {
    const text = `> ℹ️ Info Callout
    >
    > Lorem ipsum dolor  sit amet consectetur adipisicing elit.`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Multi-Block', () => {
    const text =
      "\n\n```javascript multiple.js\nconsole.log('a multi-file code block');\n```\n```javascript\nconsole.log('an unnamed sample snippet');\n```\n\n&nbsp;";
    const ast = process(text);
    expect(ast).toMatchSnapshot();
  });

  it('Single Block', () => {
    const text = "\n\n```javascript single.js\nconsole.log('a single-file code block');\n```\n\n&nbsp;";
    const ast = process(text);
    expect(ast).toMatchSnapshot();
  });

  it('When fools just, like, totally disregard newlines...', () => {
    // See this comment for more...
    // https://github.com/readmeio/api-explorer/pull/627#discussion_r415420860
    const md =
      "\n\n```javascript single.js\nconsole.log('I should be a single code block');\n```\n## I Should be an H3 Tag\n```javascript single.js\nconsole.log('I\\'m also a single code block');\n```\n\n";
    const ast = process(md);
    expect(ast.children).toHaveLength(3);
  });
});
