const serialize = {
  match: node => node.type === 'break',
  matchMdast: node => node.type === 'thematicBreak',
  fromMdast: () => ({
    object: 'block',
    type: 'break',
  }),
  toMdast: () => ({ type: 'thematicBreak' }),
};

export default serialize;
