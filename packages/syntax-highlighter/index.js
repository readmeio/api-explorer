const React = require('react');
const codemirror = require('./codemirror.jsx');

// eslint-disable-next-line react/display-name
module.exports = (code, lang, opts = { dark: false, tokenizeVariables: false }) =>
  React.createElement(
    'span',
    {
      className: opts.dark ? 'cm-s-tomorrow-night' : 'cm-s-neo',
    },
    codemirror(typeof code === 'string' ? code : '', lang, opts),
  );

module.exports.uppercase = require('./uppercase');
