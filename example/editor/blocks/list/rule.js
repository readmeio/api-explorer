const serialize = {
  match: node => node.object === 'block' && node.type === 'list',
  matchMdast: node => node.type === 'list',
  fromMdast: (node, _index, _parent, { visitChildren }) => {
    const { ordered = true } = node;
    return ({
      object: 'block',
      type: 'list',
      data: { ordered },
      nodes: visitChildren(node),
    });
  },
  toMdast: (object, _index, _parent, { visitChildren }) => {
    const { ordered } = object.data;
    return ({
      type: 'list',
      children: visitChildren(object),
      ordered,
    });
  },
};

export default serialize;
