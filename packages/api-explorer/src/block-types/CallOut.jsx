const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('../lib/markdown');

function Icon({ type }) {
  switch (type) {
    case 'info':
      return <i className="fa fa-info-circle" title="Info" />;
    case 'warning':
      return <i className="fa fa-exclamation-circle" title="Warning" />;
    case 'danger':
      return <i className="fa fa-exclamation-triangle" title="Danger" />;
    case 'success':
      return <i className="fa fa-check-square" title="Success" />;
    default:
      return null;
  }
}

const CallOut = ({ block, flags }) => {
  return (
    <div
      className={`magic-block-callout type-${block.data.type} ${block.data.title
        ? ''
        : 'no-title'} `}
    >
      {block.data.title && (
        <h3>
          <Icon type={block.data.type} />
          {block.data.title}
        </h3>
      )}

      {!block.data.title && (
        <span className="noTitleIcon">
          <Icon type={block.data.type} />
        </span>
      )}
      {/* eslint-disable react/no-danger */}
      {block.data &&
      block.data.body && (
        <div
          className="callout-body"
          dangerouslySetInnerHTML={{ __html: markdown(block.data.body, flags) }}
        />
      )}
      {/* eslint-enable react/no-danger */}
    </div>
  );
};

CallOut.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      type: PropTypes.string.isRequired,
      title: PropTypes.string,
      body: PropTypes.string,
    }),
  }).isRequired,
  flags: PropTypes.shape({}),
};

CallOut.defaultProps = { flags: {} };

Icon.propTypes = {
  type: PropTypes.string.isRequired,
};

module.exports = CallOut;
