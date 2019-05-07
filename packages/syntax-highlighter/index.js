const React = require('react');
const codemirror = require('./codemirror.jsx');

// eslint-disable-next-line arrow-body-style
module.exports = (code, lang, opts = { dark: false, tokenizeVariables: false }) => {
  return React.createElement(
    'span',
    {
      className: opts.dark ? 'cm-s-tomorrow-night' : 'cm-s-neo',
    },
    codemirror(code, lang, opts),
  );
};
module.exports.uppercase = require('./uppercase');
