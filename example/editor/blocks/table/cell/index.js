import rule from './rule';
import render from './render';

export default {
  type: 'list-item',
  rule,
  render,
  match: ['td', 'tableCell', 'table-cell'],
};

export { rule, render };
