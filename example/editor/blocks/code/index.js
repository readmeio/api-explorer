import rule from './rule';
import render from './render';

export default {
  type: 'code',
  match: ['pre', 'code-block', 'codeBlock'],
  rule,
  render,
  queries: {
    inCodeBlock: editor => editor.value.blocks.every(block => block.get('type') === 'code'),
  },
};

export { rule, render };
