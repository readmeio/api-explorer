const serialize = {
  match: node => node.object === 'block' && node.type === 'paragraph',
  matchMdast: node => node.type === 'paragraph',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'paragraph',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'paragraph',
    children: visitChildren(object),
  }),
};

export default serialize;
