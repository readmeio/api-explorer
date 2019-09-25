const serialize = {
  match: node => node.object === 'block' && node.type === 'rdme-callout',
  matchMdast: node => node.type === 'rdme-callout',
  fromMdast: (node, _index, _parent, { visitChildren }) => {
    console.log('fromMdast', { node });
    return {
      object: 'block',
      type: 'rdme-callout',
      data: node.data.hProperties,
      nodes: visitChildren(node),
    };
  },
  toMdast: (object, _index, _parent, { visitChildren }) => {
    console.log('toMdast', { object });
    return {
      type: 'rdme-callout',
      children: visitChildren(object),
    };
  },
};

export default serialize;
