const serialize = {
  match: node => node.object === 'block' && node.type === 'rdme-figure',
  matchMdast: node => node.type === 'rdme-figure',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'rdme-figure',
    data: {
      className: node.className,
    },
    nodes: visitChildren(node),
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'rdme-figure',
    className: object.data.className,
    children: visitChildren(object),
    data: { hName: 'rdme-figure' },
  }),
};

export default serialize;
