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
  // schema: {
  //   nodes: [{
  //     match: { type: 'list-item' },
  //     min: 1,
  //   }],
  //   normalize: (editor, error) => {
  //     if (error.code === 'child_type_invalid') {
  //       return editor
  //         .setBlocks('list-item')
  //         .unwrapBlock()
  //         .wrapBlock({
  //           type: 'list',
  //           data: { ordered: true },
  //         });
  //     }
  //   },
  // },
};

export { rule, render };
