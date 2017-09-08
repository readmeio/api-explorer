const React = require('react');
const PropTypes = require('prop-types');

const Html = ({ block }) => {
  // eslint-disable-next-line react/no-danger
  return <div className="magic-block-html" dangerouslySetInnerHTML={{ __html: block.data.html }} />;
};

Html.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      html: PropTypes.string.isRequired,
    }),
  }).isRequired,
};
module.exports = Html;
