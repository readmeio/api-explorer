const serialize = {
  match: node => node.object === 'block' && node.type === 'tableCell',
  matchMdast: node => node.type === 'tableCell',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'tableCell',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'tableCell',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};

export default serialize;
