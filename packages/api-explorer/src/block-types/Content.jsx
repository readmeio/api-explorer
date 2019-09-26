const React = require('react');
const rdmd = require('@readme/markdown');

module.exports = props => (
  <div className="markdown-body">
    {rdmd.render.hub(props.body, rdmd.options)}
  </div>
);
