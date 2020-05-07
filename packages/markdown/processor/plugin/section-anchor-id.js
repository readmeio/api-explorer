const flatMap = require('unist-util-flatmap');
const kebabCase = require('lodash/kebabCase');

const matchTag = /^h[1-6]$/g;

/** Concat a deep text value from an AST node's children
 */
const getTexts = node => {
  let text = '';
  flatMap(node, kid => {
    text += kid.type === 'text' ? kid.value : '';
    return [kid];
  });
  return text;
};

/** Adds an empty <div id=section-slug> next to all headings
 *  for backwards-compatibility with how we used to do slugs.
 */
function transformer(ast) {
  return flatMap(ast, node => {
    if (matchTag.test(node.tagName) || node?.properties?.id) {
      const useIdProp = node?.properties?.id.match(/^.*[A-Z].*$/);

      const id = `section-${kebabCase(!useIdProp && getTexts(node) || node.properties.id)}`;
      const element = { type: 'element', tagName: 'div', properties: { id } };

      if (node.children) node.children.unshift(element);
      else node.children = [element];
    }
    return [node];
  });
}

module.exports = () => transformer;
