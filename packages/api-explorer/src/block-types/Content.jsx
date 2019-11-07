const React = require('react');

/** To make this work in a PR app you need to
 * 'flip' these two lines and npm install the
 *  readmeio/api-explorer#beta/editor-hacking
 *  GitHub branch. Hey! If it works, it works!
 */
const markdown = require('@readme/markdown');
// const markdown = require('api-explorer/packages/markdown/dist/main');

module.exports = props => (
  <div className="markdown-body">{markdown.render.hub(props.body, markdown.options)}</div>
);
