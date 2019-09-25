import rule from './rule';
import render from './render';

export default {
  type: 'link',
  match: ['a', 'anchor', 'url'],
  rule,
  render,
};

export { rule, render };
