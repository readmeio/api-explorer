import rule from './rule';
import render from './render';

export default {
  type: 'list-item',
  rule,
  render,
  match: ['th', 'tableHead', 'table-head'],
};

export { rule, render };
