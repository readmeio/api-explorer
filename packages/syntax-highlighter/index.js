const React = require('react');
const codemirror = require('./codemirror.jsx');

const SyntaxHighlighter = (code, lang, opts = { dark: false, tokenizeVariables: false }) => {
  return React.createElement(
    'span',
    {
      className: opts.dark ? 'cm-s-tomorrow-night' : 'cm-s-neo',
    },
    codemirror(typeof code === 'string' ? code : '', lang, opts),
  );
};

module.exports = SyntaxHighlighter;
module.exports.uppercase = require('./uppercase');
