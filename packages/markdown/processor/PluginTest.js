import map from 'unist-util-map';

/**
 * A transformer plugin for the Unified JS ecosyste,
 *---
 * @docs    https://github.com/syntax-tree/unist-util-map
 *          https://github.com/unifiedjs/unified#function-attacheroptions
 *          https://github.com/unifiedjs/unified#function-transformernode-file-next
 * @example https://unifiedjs.com/create-a-plugin.html#plugin
 */
const transform = tree =>
  map(tree, node => {
    if (node.type === 'embed')
      return {
        ...node,
        data: { ...node.data, hName: 'embed' },
      };
    if (node.type === 'link' && 'title' in node && node.title && node.title[0] === '@')
      return {
        ...node,
        type: 'embed',
        children: [{ type: 'text', value: node.title }],
        data: {
          ...node.data,
          hProperties: { href: node.url, title: node.title },
          hName: 'embed',
        },
      };
    return node;
  });

function attacher() {
  return transform;
}

export default attacher;
