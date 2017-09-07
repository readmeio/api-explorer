const React = require('react');

const HTML = ({block}) => (
  <div className="magic-block-html" dangerouslySetInnerHTML={{__html: block.data.html}}>
  </div>
);

module.exports = HTML;
