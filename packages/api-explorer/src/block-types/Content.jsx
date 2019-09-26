const React = require('react');
// const rdmd = require('@readme/markdown');
const rdmd = require('api-explorer/packages/markdown/dist/main');

module.exports = props => (
  <div className="markdown-body">
    {rdmd.render.hub(props.body, rdmd.options)}
  </div>
);
