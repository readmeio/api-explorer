const React = require('react');
const fs = require('fs');
const { mount } = require('enzyme');
const Content = require('../../src/block-types/Content');

describe('Content', () => {
  test('should output one of each block type', () => {
    const body = fs.readFileSync(`${__dirname}/blocks.txt`, 'utf8');
    const content = mount(<Content body={body} />);

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
});
