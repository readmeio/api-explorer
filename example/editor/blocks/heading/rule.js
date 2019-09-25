const hmatches = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const serialize = {
  match: node => 
    node.object === 'block' && hmatches.indexOf(node.type)>=0,
  matchMdast: node => 
    node.type === 'heading' && node.depth>0 && (node.depth-1)<=hmatches.length,
  fromMdast: (node, _index, _parent, { visitChildren }) => ({
    object: 'block',
    type: `h${node.depth}`,
    nodes: visitChildren(node)
  }),
  toMdast: (object, _index, _parent, { visitChildren }) => {
    const [,depth] = /h(\d)/.exec(object.type);
    return ({
      type: 'heading',
      depth: parseInt(depth),
      children: visitChildren(object),
    });
  },
};

export default serialize;
