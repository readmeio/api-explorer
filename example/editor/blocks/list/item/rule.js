const serialize = {
  match: node => node.object === 'block' && node.type === 'list-item',
  matchMdast: node => node.type === 'listItem',
  fromMdast: (node, _index, _parent, { visitChildren }) => {
    const { checked } = node;
    return ({
      object: 'block',
      type: 'list-item',
      nodes: visitChildren(node),
      // checked: typeof checked === 'boolean' ? checked : {},
      data: typeof checked === 'boolean' ? { checked } : {},
    });
  },
  toMdast: (object, _index, _parent, { visitChildren }) => ({
    type: 'listItem',
    checked: 'checked' in object.data ? object.data.checked : null,
    children: visitChildren(object),
  }),
};

export default serialize;
