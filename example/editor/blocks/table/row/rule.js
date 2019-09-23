const serialize = {
  match: node => node.object === 'block' && node.type === 'tableRow',
  matchMdast: node => node.type === 'tableRow',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: 'tableRow',
    nodes: visitChildren(node),
  }),
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'tableRow',
    value: visitChildren(node),
    children: visitChildren(node),
  }),
};

export default serialize;
