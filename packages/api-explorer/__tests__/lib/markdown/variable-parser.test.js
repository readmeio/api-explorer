const remark = require('remark');
const parser = require('../../../src/lib/markdown/variable-parser');

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

  expect(remark().use(parser).data('settings', { position: false }).parse(markdown)).toEqual(ast);
});
