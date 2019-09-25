import rule from './rule';
import render from './render';

export default {
  type: 'blockquote',
  match: ['quote', 'block-quote'],
  rule,
  render,
};

export { rule, render };
