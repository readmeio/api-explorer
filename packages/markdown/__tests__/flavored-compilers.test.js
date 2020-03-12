const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkStringify = require('remark-stringify');
const rehypeSanitize = require('rehype-sanitize');

const parseCallouts = require('../processor/parse/flavored/callout');
const parseCodeTabs = require('../processor/parse/flavored/code-tabs');
const parseEmbeds = require('../processor/parse/flavored/embed');
const options = require('../processor/options.json').markdownOptions;
const parser = require('../processor/parse/magic-block-parser');

const DivCompiler = require('../processor/compile/div');
const CodeTabsCompiler = require('../processor/compile/code-tabs');
const CalloutCompiler = require('../processor/compile/callout');
const EmbedCompiler = require('../processor/compile/embed');

const sanitize = { attributes: [], tagNames: [] };
const process = unified()
  .use(remarkParse, options)
  .data('settings', { position: false })
  .use(parser.sanitize(sanitize))
  .use([parseCallouts.sanitize(sanitize), parseEmbeds.sanitize(sanitize), parseCodeTabs.sanitize(sanitize)])
  .use(rehypeSanitize);

const parse = text => text && process().parse(text);
const compile = tree =>
  tree &&
  process()
    .use(remarkStringify, options)
    .use([DivCompiler, CodeTabsCompiler, CalloutCompiler, EmbedCompiler])
    .stringify(tree);

describe('ReadMe Magic Blocks', () => {
  it('Embed', () => {
    const txt = `[block:embed]
    {
      "html": false,
      "url": "https://youtu.be/J3-uKv1DShQ",
      "title": null,
      "favicon": "https://youtu.be/favicon.ico"
    }
    [/block]`;
    const ast = parse(txt);
    const out = compile(ast);
    expect(out).toMatchSnapshot();
  });

  it('Code Tabs', () => {
    const txt = `[block:code]
    {
      "codes": [
        {
          "code": "console.log('a multi-file code block');",
          "language": "javascript",
          "name": "multiple.js"
        },
        {
          "code": "console.log('an unnamed sample snippet');",
          "language": "javascript"
        }
      ]
    }
    [/block]
    `;
    const ast = parse(txt);
    const out = compile(ast);
    expect(out).toMatchSnapshot();
  });

  it('Callouts', () => {
    const txt = `[block:callout]
    {
      "type": "success",
      "title": "Success",
      "body": "Vitae reprehenderit at aliquid error voluptates eum dignissimos."
    }
    [/block]

    And this is a paragraph!
    `;
    const ast = parse(txt);
    const out = compile(ast);
    expect(out).toMatchSnapshot();
  });
});
