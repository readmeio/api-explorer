const flatMap = require('unist-util-flatmap');

// Flattens table values and adds them as a seperate, easily-accessible key within children
function transformer(ast) {
  return flatMap(ast, node => {
    if (node.tagName === 'table') {
      const [header, body] = node.children;
      // hAST tables are deeply nested with an innumerable amount of children
      // This is necessary to pullout all the relevant strings

      // Parse Header Values
      const headerChildren = header.children && header.children.length ? header.children[0].children : [];
      const headerValue = headerChildren.map(hc => (hc.children.length && hc.children[0].value) || '').join(' ');
      // Parse Body Values
      const bodyChildren =
        (body.children && body.children.map(bc => bc && bc.children).reduce((a, b) => a.concat(b), [])) || [];
      const bodyValue = bodyChildren.map(bc => (bc.children.length && bc.children[0].value) || '').join(' ');

      return [
        {
          ...node,
          children: [
            {
              ...node.children[0],
              value: headerValue,
            },
            {
              ...node.children[1],
              value: bodyValue,
            },
          ],
        },
      ];
    }

    return [node];
  });
}

module.exports = () => transformer;
module.exports.tableFlattening = transformer;
