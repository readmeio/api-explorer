const serialize = {
  match: node => node.object === 'block' && node.type === 'table',
  matchMdast: node => node.type === 'table',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'table',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'table',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};

export default serialize;
