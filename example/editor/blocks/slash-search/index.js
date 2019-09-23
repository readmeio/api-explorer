import rule from './rule';
import render from './render';

export default {
  type: 'slash-search',
  rule,
  render,
  schema: {
    isVoid: true,
  },
};

export { rule, render };
