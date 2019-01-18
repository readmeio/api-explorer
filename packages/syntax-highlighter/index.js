const React = require('react');
const { codemirror, modes } = require('./codemirror.jsx');

module.exports = (code, lang, opts = { dark: false, tokenizeVariables: false }) =>
  React.createElement(
    'span',
    {
      className: opts.dark ? 'cm-s-tomorrow-night' : 'cm-s-neo',
    },
    codemirror(code, lang, opts),
  );

module.exports.uppercase = require('./uppercase');

module.exports.modes = modes;
