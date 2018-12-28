const unified = require('unified');
const remarkParse = require('remark-parse');
const parser = require('../variable-parser');

it('should output a variable node', () => {
  const markdown = 'This is a test <<apiKey>>.';
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'This is a test ' },
          {
            type: 'readme-variable',
            data: {
              hName: 'readme-variable',
              hProperties: {
                variable: 'apiKey',
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

it('should output a glossary node', () => {
  const markdown = 'This is a test <<glossary:item>>.';
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'This is a test ' },
          {
            type: 'readme-glossary-item',
            data: {
              hName: 'readme-glossary-item',
              hProperties: {
                term: 'item',
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

it('should allow whitespace in glossary names', () => {
  const markdown = 'This is a test <<glossary:item name>>.';
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'This is a test ' },
          {
            type: 'readme-glossary-item',
            data: {
              hName: 'readme-glossary-item',
              hProperties: {
                term: 'item name',
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

it('should allow escape variables to remain', () => {
  const markdown = 'This is a test escaped key \\<<apiKey\\>>.';
  const ast = {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'This is a test escaped key ' },
          { type: 'text', value: '<<apiKey>>' },
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
