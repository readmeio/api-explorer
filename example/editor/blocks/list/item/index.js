import rule from './rule';
import render from './render';

export default {
  type: 'list-item',
  rule,
  render,
  match: ['item', 'listItem', 'li'],
  schema: {
    parent: { type: 'list' },
    normalize: (editor, error) => {
      if (error.code === 'parent_type_invalid') {
        editor.wrapBlock('list');
      }
    }
  },
};

export { rule, render };
