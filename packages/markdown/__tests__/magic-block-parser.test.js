const unified = require('unified');
const remarkParse = require('remark-parse');
const rehypeSanitize = require('rehype-sanitize');

const parser = require('../processor/parse/magic-block-parser');
const options = require('../processor/options.json').markdownOptions;

const sanitize = { attributes: [] };
const process = (text, opts = options) =>
  text &&
  unified()
    .use(remarkParse, opts)
    .data('settings', { position: false })
    .use(parser.sanitize(sanitize))
    .use(rehypeSanitize)
    .parse(text);

test('Sanitize Schema', () => {
  parser.sanitize(sanitize);
  expect(sanitize).toMatchSnapshot();
});

describe('Parse Magic Blocks', () => {
  it('Heading Blocks', () => {
    const text = `[block:api-header]
    {
      "title": "MagicBlock Conversion",
      "level": 2
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Image Blocks', () => {
    const text = `[block:image]
    {
      "images": [
        {
          "image": [
            "https://files.readme.io/62083ee-White_Center_Blue_BG.svg",
            "White Center Blue BG.svg",
            240,
            150,
            "#000000"
            ],
          "caption": "Qui iusto fugiat doloremque? Facilis obcaecati vitae corrupti.",
          "sizing": "80",
          "border": true
        }
      ]
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Code Blocks', () => {
    const text = `[block:code]
    {
      "codes": [
        {
          "code": "$http.post('/someUrl', data).success(successCallback);\\n\\nalert('test');",
          "language": "javascript"
        },
        {
          "code": "second tab",
          "language": "text",
          "name": "custom title"
        }
      ]
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Table Blocks', () => {
    const text = `[block:parameters]
    {
      "data": {
        "h-0": "Left",
        "h-1": "Center",
        "h-2": "Right",
        "0-0": "L0",
        "0-1": "*bold*",
        "0-2": "$1600",
        "2-0": "L2",
        "1-0": "L1",
        "1-1": "\`code\`",
        "1-2": "$12",
        "2-1": "_italic_",
        "2-2": "$1"
      },
      "cols": 3,
      "rows": 3
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Embed Blocks', () => {
    const text = `[block:embed]
    {
      "html": false,
      "url": "https://youtu.be/J3-uKv1DShQ",
      "title": null,
      "favicon": "https://youtu.be/favicon.ico",
      "iframe": false
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Callout Blocks', () => {
    const text = `[block:callout]
    {
      "type": "success",
      "title": "Callout Title",
      "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });

  it('Unrecognized Blocks', () => {
    const text = `[block:unrecognized]
    {
      "color": "#f00",
      "title": "Title",
      "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
    }
    [/block]`;
    expect(process(text)).toMatchSnapshot();
  });
});
