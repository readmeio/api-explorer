const serialize = {
  match: node => node.object === 'block' && node.type === 'slash-search',
  matchMdast: node => node.type === 'slash-search',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'slash-search',
    nodes: visitChildren(node),
    data: {
      className: node.className,
    },
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'slash-search',
    children: visitChildren(node),
    className: node.data.className,
    data: { hName: 'slash-search' },
  }),
};

export default serialize;
