const unified = require('unified');
const sanitize = require('hast-util-sanitize/lib/github.json');

const remarkParse = require('remark-parse');
const remarkStringify = require('remark-stringify');
const rehypeSanitize = require('rehype-sanitize');

const parsers = Object.values(require('../processor/parse')).map(parser => parser.sanitize(sanitize));
const compilers = Object.values(require('../processor/compile'));
const options = require('../options.json').markdownOptions;

const processor = unified()
  .use(remarkParse, options)
  .data('settings', { position: false })
  .use(parsers)
  .use(rehypeSanitize);

const parse = text => text && processor().parse(text);
const compile = tree => tree && processor().use(remarkStringify, options).use(compilers).stringify(tree);

describe('ReadMe Flavored Blocks', () => {
  it('Embed', () => {
    const txt = `[Embedded meta links.](https://nyti.me/s/gzoa2xb2v3 "@nyt")`;
    const ast = parse(txt);
    const out = compile(ast);
    expect(out).toMatchSnapshot();
  });
});

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

  it('Figure', () => {
    const txt = `[block:image]
    {
      "images": [
        {
          "image": [
            "https://files.readme.io/6f52e22-man-eating-pizza-and-making-an-ok-gesture.jpg",
            "rdme-blue.svg",
            300,
            54,
            "#000000"
          ],
          "caption": "Ok, pizza man."
        }
      ],
      "sidebar": true
    }
    [/block]`;
    const ast = parse(txt);
    const out = compile(ast);
    expect(out).toMatchSnapshot();
  });
});
