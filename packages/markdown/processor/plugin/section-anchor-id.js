const flatMap = require('unist-util-flatmap');
// const kebab = require('lodash/kebabCase');

// Adds an empty <div id='section-slug'> next to all headings.
// This is for compatibility with how we used to do slugs
function transformer(ast) {
  return flatMap(ast, node => {
    if (node.type === 'element' && node.properties && node.properties.id) {
      const id = `section-${node.properties.id}`;
      return [node, { type: 'element', tagName: 'div', properties: { id } }];
    }
    return [node];
  });
}

module.exports = () => transformer;
