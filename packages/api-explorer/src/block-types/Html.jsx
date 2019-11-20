const React = require('react');
const PropTypes = require('prop-types');

const Html = ({ block }) => {
  return <div dangerouslySetInnerHTML={{ __html: block.data.html }} className="magic-block-html" />;
};

Html.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      html: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

module.exports = Html;
