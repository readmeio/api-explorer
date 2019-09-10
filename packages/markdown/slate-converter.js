const phrasing = require('mdast-util-phrasing');
const flat = require('lodash/flatten');

const toSlate = node => {
  node.children = node.children || [];
  // console.log(node.type, node)
  if (phrasing(node)) {
    const parentMark = {
      object: 'mark',
      type: node.tagName || node.type,
    };
    const nodes = flat(node.children.map(child => {
      const childMark = child.type !== 'text' && {
        object: 'mark',
        type: child.tagName || child.type,
      };
      return {
        object: 'text',
        text: child.value,
        marks: [parentMark, childMark].filter(Boolean),
      };
    }));
  }
  if (node.type === 'text')
    return {
      object: 'text',
      text: node.value,
    };
  return {
    object: 'block',
    type: node.tagName || node.type,
    nodes: flat(node.children.map(toSlate)),
  };
};

module.exports = function remarkSlate() {
  function compiler(node) {
    if (node.type === 'root') {
      return {
        object: 'value',
        document: {
          object: 'document',
          data: {},
          nodes: flat(node.children.map(toSlate)),
        },
      };
    }
  }
  this.Compiler = compiler;
};
