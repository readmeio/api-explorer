const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('@mia-platform/markdown');

const Textarea = ({ block, flags, baseUrl }) => {
  const combined = Object.assign(
    {
      baseUrl,
    },
    flags,
  );

  return <div className="magic-block-textarea">{markdown(block.text, combined)}</div>;
};

Textarea.propTypes = {
  block: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
  flags: PropTypes.shape({}),
  baseUrl: PropTypes.string,
};

Textarea.defaultProps = {
  flags: {},
  baseUrl: '/',
};
module.exports = Textarea;
