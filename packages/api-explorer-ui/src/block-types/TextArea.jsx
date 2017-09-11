// import Marked from '../lib/marked';
const React = require('react');
const PropTypes = require('prop-types');

const Textarea = ({ block }) => {
  return (
    <div className="magic-block-textarea">
      {
        // TODO add marked
        block.text
      }
    </div>
  );
};

Textarea.propTypes = {
  block: PropTypes.shape({
    text: PropTypes.string.isRequired,
  }).isRequired,
};
module.exports = Textarea;
