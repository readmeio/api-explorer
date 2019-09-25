const serialize = {
  match: node => node.object === 'inline' && node.type === 'link',
  matchMdast: node => node.type === 'link',
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'inline',
    type: 'link',
    data: {
      href: node.url,
      title: node.title,
      target: node.target,
    },
    nodes: visitChildren(node),
  }),
  toMdast: (mark, _index, _parent, { visitChildren }) => ({
    type: 'link',
    url: mark.data.href,
    title: mark.data.title,
    target: mark.data.target,
    children: visitChildren(mark),
  }),
};

export default serialize;
