import rule from './rule';
import render from './render';

export default {
  rule,
  render,
  match: ['item', 'list-item', 'listItem', 'li'],
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
