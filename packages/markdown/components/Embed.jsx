/* eslint-disable react/jsx-props-no-spreading, jsx-a11y/iframe-has-title */
const React = require('react');
const propTypes = require('prop-types');

class Embed extends React.Component {
  render() {
    const { url, html, iframe, ...attrs } = this.props;
    if ('iframe' in this.props) return <iframe {...attrs} border="none" src={url} style={{ border: 'none' }} />;
    return (
      <div className="embed">
        {html ? (
          <div className="embed-media" dangerouslySetInnerHTML={{ __html: html }}></div>
        ) : (
          <a
            href={url}
            rel="noopener noreferrer"
            style={{
              display: 'block',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              textDecoration: 'none',
            }}
            target="_blank"
          >
            <b style={{ color: '#333' }}>View Embed:</b> <span style={{ opacity: 0.75 }}>{url}</span>
          </a>
        )}
      </div>
    );
  }
}

Embed.propTypes = {
  children: propTypes.oneOfType([propTypes.string, propTypes.array, propTypes.shape({}), propTypes.element]),
  height: propTypes.string,
  html: propTypes.string,
  iframe: propTypes.any,
  url: propTypes.oneOfType([propTypes.string, propTypes.shape({})]),
  width: propTypes.string,
};
Embed.defaultProps = {
  height: '300px',
  width: '100%',
};

module.exports = () => Embed;
