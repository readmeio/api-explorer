import rule from './rule';
import render from './render';

export default {
  type: 'table-row',
  match: ['tr', 'tableRow', 'table-row'],
  rule,
  render,
};

export { rule, render };
