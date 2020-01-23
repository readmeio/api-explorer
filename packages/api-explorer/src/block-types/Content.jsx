const React = require('react');
const PropTypes = require('prop-types');

const markdown = require('@readme/markdown').default;

const Content = props => {
  const { body, isThreeColumn } = props;
  const content = markdown(body);

  if (isThreeColumn === true) {
    return (
      <div className="hub-reference-section">
        <div className="hub-reference-left">
          <div className="markdown-body">{content}</div>
        </div>
        <div className="hub-reference-right">
          <div className="markdown-body">{content}</div>
        </div>
      </div>
    );
  }

  return <div className="markdown-body">{content}</div>;
};

Content.propTypes = {
  body: PropTypes.string,
  flags: PropTypes.shape({}),
  isThreeColumn: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

Content.defaultProps = {
  body: '',
  flags: {},
  isThreeColumn: true,
};

module.exports = Content;
