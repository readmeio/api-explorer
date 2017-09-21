const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('../lib/markdown');

const Textarea = ({ block, flags }) => {
  return (
    <div
      className="magic-block-textarea"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: markdown(block.text, flags) }}
    />
  );
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
