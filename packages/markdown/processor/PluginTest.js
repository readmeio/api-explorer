import visit from 'unist-util-visit';
import map from 'unist-util-map';

/**
 * A transformer plugin for the Unified JS ecosyste,
 *---
 * @docs    https://github.com/syntax-tree/unist-util-map
 *          https://github.com/unifiedjs/unified#function-attacheroptions
 *          https://github.com/unifiedjs/unified#function-transformernode-file-next
 * @example https://unifiedjs.com/create-a-plugin.html#plugin
 */
function transform(tree) {
  const now = map(tree, node => {
    if (node.type === 'link' && 'title' in node && node.title && node.title[0] === '@')
      // eslint-disable-next-line no-param-reassign
      node = {
        ...node,
        type: 'embed',
        data: {
          ...node.data,
          hName: 'a',
          hProperties: { href: node.url, title: node.title },
        },
      };
    console.log(node)
    return node;
  });
  return now;
}

function attacher(options) {
  return transform;
}

export default attacher;
