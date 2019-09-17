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
  schema: {
    nodes: [{
      match: { type: 'list-item' },
      min: 1,
    }],
    normalize: (editor, error) => {
      console.warn(error.code)
    },
  },
};

export { rule, render };
