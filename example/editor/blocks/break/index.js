import rule from './rule';
import render from './render';

export default {
  type: 'break',
  match: ['hr', 'rule', 'br', 'break', 'horizontal-rule'],
  rule,
  render,
};

export { rule, render };
