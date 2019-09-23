/* eslint-disable */
import React from 'react';
// const highlight = require('@readme/syntax-highlighter');

export default function Code({ attributes, children, node }) {
  const lang = node.data.get('lang') || '';
  const classes = [node.data.get('className'), `lang-${lang}`].join(' ');
  console.log(arguments[0])

  return (
    <pre {...attributes} className={classes} data-lang={lang}>
      {
        // highlight(node.nodes.get(0).text, 'php', { tokenizeVariables: false })
        //^using our syntax higlighter breaks Slate selection + serialization
      }
      {children}
    </pre>
  );
}