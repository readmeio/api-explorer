const unified = require('unified');
const remarkParse = require('remark-parse');
const rehypeSanitize = require('rehype-sanitize');

const parseCallouts = require('../processor/parse/flavored/callout');
const parseCodeTabs = require('../processor/parse/flavored/code-tabs');
const options = require('../processor/options.json').markdownOptions;

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
    const text = "\n\n```javascript multiple.js\nconsole.log('a multi-file code block');\n```\n\n&nbsp;";
    const ast = process(text);
    expect(ast).toMatchSnapshot();
  });
});
