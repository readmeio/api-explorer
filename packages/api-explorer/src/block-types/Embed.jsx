const React = require('react');
const PropTypes = require('prop-types');

const Embed = ({ block }) => {
  return (
    <div className="magic-block-embed">
      {(() => {
        if (block.data.html) {
          // eslint-disable-next-line react/no-danger
          return <span dangerouslySetInnerHTML={{ __html: block.data.html }} />;
        } else if (block.data.iframe) {
          return (
            <iframe
              className="media-iframe"
              title={block.data.title}
              src={block.data.url}
              width={block.data.width || '100%'}
              height={block.data.height || '300px'}
            />
          );
        }
        return (
          <strong>
            {block.data.favicon && <img src={block.data.favicon} className="favicon" alt="" />}
            <a href={block.data.url} target="_new">
              {block.data.title || block.data.url}
            </a>
          </strong>
        );
      })()}
    </div>
  );
};

Embed.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      html: PropTypes.boolean,
      iframe: PropTypes.boolean,
      url: PropTypes.string.isRequired,
      favicon: PropTypes.string.isRequired,
      width: PropTypes.string,
      height: PropTypes.string,
      title: PropTypes.string,
    }),
  }).isRequired,
};

Embed.defaultProps = {
  block: {
    data: {
      title: '',
    },
  },
};

module.exports = Embed;
