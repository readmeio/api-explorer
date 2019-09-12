const parser = require('../').render.ast;
const options = require('./options.md.json');

it('should render a Markdown header for a [block:api-heading]', () => {
  const magicblock = `[block:api-header]
  {
    "title": "MagicBlock Conversion",
    "level": 2
  }
  [/block]`;
  const ast = {
    type: 'root',
    children: [
      {
        type: 'heading',
        depth: 2,
        children: [
          {
            type: 'text',
            value: 'MagicBlock Conversion',
          },
        ],
      },
    ],
  };
  expect(parser(magicblock, options)).toEqual(ast);
});

it('should output a Markdown image for a [block:image]', () => {
  const magicblock = `[block:image]
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
  const ast = {
    type: 'root',
    children: [
      {
        type: 'figure',
        className: 'test',
        children: [
          {
            type: 'image',
            title: 'Qui iusto fugiat doloremque? Facilis obcaecati vitae corrupti.',
            url: 'https://files.readme.io/62083ee-White_Center_Blue_BG.svg',
            alt: 'White Center Blue BG.svg',
          },
        ],
      },
    ],
  };
  expect(parser(magicblock, options)).toEqual(ast);
});

it('should output Markdown code blocks for a [block:code]', () => {
  const magicblock = `[block:code]
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
  const ast = {
    type: 'root',
    children: [
      {
        type: 'rdme-wrap',
        className: 'tabs',
        data: {
          hName: 'rdme-wrap',
        },
        children: [
          {
            type: 'code',
            value: "$http.post('/someUrl', data).success(successCallback);\n\nalert('test');",
            meta: null,
            lang: 'javascript',
            className: 'tab-panel',
          },
          {
            type: 'code',
            value: 'second tab',
            meta: 'custom title',
            lang: 'text',
            className: 'tab-panel',
          },
        ],
      },
    ],
  };
  expect(parser(magicblock, options)).toEqual(ast);
});

it('should output a Markdown blockquote for a [block:callout]', () => {
  const magicblock = `[block:callout]
  {
    "type": "success",
    "title": "Callout Title",
    "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
  }
  [/block]`;
  const ast = {
    type: 'root',
    children: [
      {
        type: 'blockquote',
        className: 'success',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: '👍 ',
              },
              {
                type: 'strong',
                children: [
                  {
                    type: 'text',
                    value: 'Callout Title',
                  },
                ],
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'Lorem ipsum dolor sit amet, ',
              },
              {
                type: 'emphasis',
                children: [
                  {
                    type: 'text',
                    value: 'consectetur',
                  },
                ],
              },
              {
                type: 'text',
                value:
                  ' adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum',
              },
            ],
          },
        ],
      },
    ],
  };
  expect(parser(magicblock, options)).toEqual(ast);
});

it('should output a Markdown paragraph for any unrecognized [block:type]', () => {
  const magicblock = `[block:unrecognized]
  {
    "color": "#f00",
    "title": "Title",
    "body": "Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum"
  }
  [/block]`;
  const ast = {
    type: 'root',
    children: [
      {
        type: 'div',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'Lorem ipsum dolor sit amet, ',
              },
              {
                type: 'emphasis',
                children: [
                  {
                    type: 'text',
                    value: 'consectetur',
                  },
                ],
              },
              {
                type: 'text',
                value:
                  ' adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum',
              },
            ],
          },
        ],
        data: {
          color: '#f00',
          title: 'Title',
          body:
            'Lorem ipsum dolor sit amet, _consectetur_ adipiscing elit. Praesent nec massa tristique arcu fermentum dapibus. Integer orci turpis, mollis vel augue eget, placerat rhoncus orci. Mauris metus libero, rutrum',
        },
      },
    ],
  };
  expect(parser(magicblock, options)).toEqual(ast);
});
