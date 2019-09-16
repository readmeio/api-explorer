import rule from './rule';
import render from './render';

export default {
  type: 'code',
  match: ['pre', 'code-block', 'codeBlock'],
  rule,
  render,
};

export { rule, render };
