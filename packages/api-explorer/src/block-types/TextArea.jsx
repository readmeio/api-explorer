const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('@readme/markdown');

const Textarea = ({ block, flags }) => {
  return <div className="magic-block-textarea">{markdown(block.text, flags)}</div>;
};

Textarea.propTypes = {
  block: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
  flags: PropTypes.shape({}),
};

Textarea.defaultProps = {
  flags: {},
};

module.exports = Textarea;
