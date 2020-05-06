const flatMap = require('unist-util-flatmap');
const kebabCase = require('lodash/kebabCase');

// Adds an empty <div id='section-slug'> next to all headings.
// This is for compatibility with how we used to do slugs
function transformer(ast) {
  return flatMap(ast, node => {
    if (node.type === 'element' && node.properties && node.properties.id) {
      const id = `section-${kebabCase(node.properties.id)}`;
      const element = { type: 'element', tagName: 'div', properties: { id } };

      if (node.children) {
        node.children.push(element);
      } else {
        node.children = [element];
      }
    }
    return [node];
  });
}

module.exports = () => transformer;
