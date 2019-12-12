const React = require('react');
const PropTypes = require('prop-types');

/** To make this work in a PR app you need to
 * 'flip' these two lines and npm install the
 *  readmeio/api-explorer#beta/editor-hacking
 *  GitHub branch. Hey! If it works, it works!
 */
const markdown = require('@readme/markdown').default;
// const markdown = require('api-explorer/packages/markdown/dist/main');

const Content = props => (
  <div className="markdown-body">{markdown(props.body, markdown.options)}</div>
);

Content.propTypes = {
  body: PropTypes.string,
};

Content.defaultProps = {
  body: '',
};

module.exports = Content;
