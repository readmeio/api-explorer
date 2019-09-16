const serialize = {
  match: node => node.object === 'block' && node.type === 'rdme-wrap',
  matchMdast: node => node.type === 'rdme-wrap',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'rdme-wrap',
    nodes: visitChildren(node),
    data: {
      className: node.className,
    },
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'rdme-wrap',
    children: visitChildren(node),
    className: node.data.className,
    data: { hName: 'rdme-wrap' },
  }),
};

export default serialize;
