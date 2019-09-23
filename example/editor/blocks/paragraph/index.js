import rule from './rule';
import render from './render';

export default {
  type: 'paragraph',
  match: ['p', 'text'],
  rule,
  render,
};

export { rule, render };
