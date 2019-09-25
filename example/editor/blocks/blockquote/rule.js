const serialize = {
  match: node => node.object === 'block' && node.type === 'blockquote',
  matchMdast: node => node.type === 'blockquote',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'blockquote',
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'blockquote',
    children: visitChildren(object),
  }),
};

export default serialize;
