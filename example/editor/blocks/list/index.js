import rule from './rule';
import render from './render';

export default {
  type: 'list',
  rule,
  render,
  match: [
    'ul',
    'ol',
    'list',
    'todo-list',
    'ordered-list',
    'bulleted-list',
    'numbered-list',
    'unordered-list',
  ],
};

export { rule, render };
