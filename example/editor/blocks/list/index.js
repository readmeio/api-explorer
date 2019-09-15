import rule from './rule';
import render from './render';

export default {
  rule,
  render,
  schema: {
    list: {
      nodes: [{
        match: { type: 'item' },
      }],
    },
    item: {
      parent: { type: 'list' },
    },
  },
};

export { rule, render };
