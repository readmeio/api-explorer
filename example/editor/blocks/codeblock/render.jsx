/* eslint-disable */
import React from 'react';
// const highlight = require('@readme/syntax-highlighter');

export default function Code(props) {
  console.log(props)
  const { attributes, children, node } = props;
  const lang = node.data.get('lang') || '';
  const classes = [
    'tab-panel',
    node.data.get('className'),
    `lang-${lang}`
  ].join(' ');
  
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