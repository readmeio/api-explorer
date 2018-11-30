const unified = require('unified');
const remarkParse = require('remark-parse');
const parser = require('../gemoji-parser');

it('should output an image node for a known emoji', () => {
  const emoji = 'joy';
  const markdown = `This is a gemoji :${emoji}:.`;
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'This is a gemoji ' },
          {
            type: 'image',
            title: `:${emoji}:`,
            alt: `:${emoji}:`,
            url: `/img/emojis/${emoji}.png`,
            data: {
              hProperties: {
                className: 'emoji',
                align: 'absmiddle',
                height: '20',
                width: '20',
              },
            },
          },
          { type: 'text', value: '.' },
        ],
      },
    ],
  };

  expect(
    unified()
      .use(remarkParse)
      .use(parser)
      .data('settings', { position: false })
      .parse(markdown),
  ).toEqual(ast);
});

it('should output an <i> for a font awesome icon', () => {
  const emoji = 'fa-lock';
  const markdown = `This is a gemoji :${emoji}:.`;
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'This is a gemoji ' },
          {
            type: 'i',
            data: {
              hName: 'i',
              hProperties: {
                className: ['fa', emoji],
              },
            },
          },
          { type: 'text', value: '.' },
        ],
      },
    ],
  };

  expect(
    unified()
      .use(remarkParse)
      .use(parser)
      .data('settings', { position: false })
      .parse(markdown),
  ).toEqual(ast);
});

it('should output nothing for unknown emojis', () => {
  const emoji = 'unknown-emoji';
  const markdown = `This is a gemoji :${emoji}:.`;
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: markdown }],
      },
    ],
  };

  expect(
    unified()
      .use(remarkParse)
      .use(parser)
      .data('settings', { position: false })
      .parse(markdown),
  ).toEqual(ast);
});
