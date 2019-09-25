import rule from './rule';
import render from './render';

export default {
  type: 'heading',
  match: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6'
  ],
  rule,
  render,
};

export { rule, render };
