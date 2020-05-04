/* eslint-disable react/jsx-props-no-spreading, jsx-a11y/iframe-has-title */
const React = require('react');
const propTypes = require('prop-types');

const Favicon = ({ src, alt = 'favicon', ...attr }) => <img {...attr} alt={alt} height="14" src={src} width="14" />;
Favicon.propTypes = {
  alt: propTypes.string,
  src: propTypes.string,
};

class Embed extends React.Component {
  render() {
    const { provider, url, title, html, iframe, image, favicon, ...attrs } = this.props;
    if ('iframe' in this.props) return <iframe {...attrs} border="none" src={url} style={{ border: 'none' }} />;
    const classes = ['embed', image && 'embed_hasImg'];
    return (
      <div className={classes.join(' ')}>
        {html ? (
          <div className="embed-media" dangerouslySetInnerHTML={{ __html: html }}></div>
        ) : (
          <a className="embed-link" href={url} rel="noopener noreferrer" target="_blank">
            {!image || <img alt={title} className="embed-img" loading="lazy" src={image} />}
            {title ? (
              <div className="embed-body">
                {!favicon || (
                  <Favicon
                    alt={provider}
                    className="embed-favicon"
                    loading="lazy"
                    src={favicon}
                    style={{ float: 'left' }}
                  />
                )}
                {provider && (
                  <small className="embed-provider">
                    {provider.search(/^@{1}/) < 0 ? (
                      provider
                    ) : (
                      <code style={{ fontFamily: 'var(--md-code-font, monospace)' }}>{url}</code>
                    )}
                  </small>
                )}
                <div className="embed-title">{title}</div>
              </div>
            ) : (
              <div className="embed-body">
                <b>View embed</b>: <span className="embed-body-url">{url}</span>
              </div>
            )}
          </a>
        )}
      </div>
    );
  }
}

Embed.propTypes = {
  children: propTypes.oneOfType([propTypes.string, propTypes.array, propTypes.shape({}), propTypes.element]),
  favicon: propTypes.string,
  height: propTypes.string,
  html: propTypes.string,
  iframe: propTypes.any,
  image: propTypes.string,
  provider: propTypes.string,
  title: propTypes.string,
  url: propTypes.oneOfType([propTypes.string, propTypes.shape({})]),
  width: propTypes.string,
};
Embed.defaultProps = {
  height: '300px',
  width: '100%',
};

module.exports = () => Embed;
