const React = require('react');
const fs = require('fs');
const { mount } = require('enzyme');
const Content = require('../../src/block-types/Content');

test('should output one of each block type', () => {
  const body = fs.readFileSync(`${__dirname}/blocks.txt`, 'utf8');
  const content = mount(<Content body={body} isThreeColumn />);

  [
    'textarea',
    'html',
    'embed',
    'api-header',
    'code',
    'callout',
    'parameters',
    'image',
  ].forEach(type => {
    expect(content.find(`.magic-block-${type}`).length).toBe(1);
  });
});

const body = `
  [block:api-header]
  {
    "title": "This is cool header",
    "sidebar": true
  }
  [/block]
  [block:textarea]
  {
    "text": "This is text area"
  }
  [/block]
`;

test('should output only left content if `isThreeColumn=left`', () => {
  const content = mount(<Content body={body} isThreeColumn='left' />);

  expect(content.find('.magic-block-textarea').length).toBe(1);
});

test('should output only right content if `isThreeColumn=right`', () => {
  const content = mount(<Content body={body} isThreeColumn='right' />);

  expect(content.find('.magic-block-api-header').length).toBe(1);
});
