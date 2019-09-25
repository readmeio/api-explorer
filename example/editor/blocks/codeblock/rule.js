const serialize = {
  match: node => node.object === 'block' && node.type === 'code',
  matchMdast: node => node.type === 'code',
  fromMdast: (node) => {
    const { lang, meta, className } = node;
    return {
      object: 'block',
      type: 'code',
      nodes: [{
        object: 'text',
        text: node.value,
      }],
      data: { lang, meta, className },
    };
  },
  toMdast: (node, _index, _parent, { visitChildren }) => ({
    type: 'code',
    lang: node.data.lang,
    meta: node.data.meta,
    value: visitChildren(node)
      .map(childNode => childNode.value)
      .filter(Boolean)
      .join('\n'),
  }),
};

export default serialize;
