const React = require('react');
const PropTypes = require('prop-types');

const HTML = ({ block }) => {
  // eslint-disable-next-line react/no-danger
  return <div className="magic-block-html" dangerouslySetInnerHTML={{ __html: block.data.html }} />;
};

HTML.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      html: PropTypes.string.isRequired,
    }),
  }).isRequired,
};
module.exports = HTML;
