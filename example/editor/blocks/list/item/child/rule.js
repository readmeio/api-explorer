const serialize = {
  match: node => node.object === 'block' && node.type === 'list-item-child',
  matchMdast: (node, _index, parent) =>
    node.type === 'paragraph' && parent.type === 'listItem',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'list-item-child',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'paragraph',
    children: visitChildren(object),
  }),
};

export default serialize;
