const flatMap = require('unist-util-flatmap');

// Adds an empty <div id='section-slug'> next to all headings.
// This is for compatibility with how we used to do slugs
function transformer(ast) {
  return flatMap(ast, node => {
    if (node.type === 'heading') {
      const id = `section-${node.data.id}`;
      return [node, { type: 'div', data: { hProperties: { id } } }];
    }
    return [node];
  });
}

module.exports = function sectionAnchorId() {
  return transformer;
};
