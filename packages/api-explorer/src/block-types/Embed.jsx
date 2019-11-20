const React = require('react');
const PropTypes = require('prop-types');

const Embed = ({ block }) => {
  return (
    <div className="magic-block-embed">
      {(() => {
        if (block.data.html) {
          return <span dangerouslySetInnerHTML={{ __html: block.data.html }} />;
        } else if (block.data.iframe) {
          return (
            <iframe
              className="media-iframe"
              height={block.data.height || '300px'}
              src={block.data.url}
              title={block.data.title}
              width={block.data.width || '100%'}
            />
          );
        }

        return (
          <strong>
            {block.data.favicon && <img alt="" className="favicon" src={block.data.favicon} />}
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
      favicon: PropTypes.string.isRequired,
      height: PropTypes.string,
      html: PropTypes.boolean,
      iframe: PropTypes.boolean,
      title: PropTypes.string,
      url: PropTypes.string.isRequired,
      width: PropTypes.string,
    }),
  }),
};

Embed.defaultProps = {
  block: {
    data: {
      title: '',
    },
  },
};

module.exports = Embed;
