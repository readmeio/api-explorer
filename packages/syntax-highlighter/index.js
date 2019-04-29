const React = require('react');
const codemirror = require('./codemirror.jsx');

module.exports = (code, lang, opts = { dark: false, tokenizeVariables: false }) =>{
  const codeMirrored = codemirror(code, lang, opts)
  return React.createElement(
    'span',
    {
      className: opts.dark ? 'cm-s-tomorrow-night' : 'cm-s-neo',
    },
    codeMirrored,
  );
  }
module.exports.uppercase = require('./uppercase');
