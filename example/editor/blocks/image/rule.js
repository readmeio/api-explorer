const serialize = {
  match: node => node.object === 'block' && node.type === 'image',
  matchMdast: node => node.type === 'image',
  fromMdast: node => ({
    object: 'block',
    type: 'image',
    isVoid: true,
    data: {
      alt: node.alt,
      src: node.url,
      title: node.title,
    },
    nodes: [],
  }),
  toMdast: (object) => {
    const { alt, src, title } = object.data;
    return ({
      type: 'image',
      alt,
      url: src,
      title,
    });
  },
};

export default serialize;
