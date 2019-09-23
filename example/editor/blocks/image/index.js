import rule from './rule';
import render from './render';

export default {
  type: 'image',
  match: ['img'],
  rule,
  render,
};

export { rule, render };
