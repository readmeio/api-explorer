const serialize = {
  match: node => node.object === 'block' && node.type === 'tableHead',
  matchMdast: node => node.type === 'tableHead',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'tableHead',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'tableCell',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};

export default serialize;
