const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('../lib/markdown');

const Textarea = ({ block }) => {
  return (
    // eslint-disable-next-line react/no-danger
    <div className="magic-block-textarea" dangerouslySetInnerHTML={{ __html: markdown(block.text) }} />
  );
};

Textarea.propTypes = {
  block: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};
module.exports = Textarea;
