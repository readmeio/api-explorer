const React = require('react');
const propTypes = require('prop-types');

class Embed extends React.Component {
  render() {
    return (
      <div className="embed">
        {this.props.html ? (
          <div className="embed-media" dangerouslySetInnerHTML={{ __html: this.props.html }}></div>
        ) : (
          <a
            href={this.props.url}
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
            <b style={{ color: '#333' }}>View Embed:</b> <span style={{ opacity: 0.75 }}>{this.props.url}</span>
          </a>
        )}
      </div>
    );
  }
}

Embed.propTypes = {
  children: propTypes.oneOfType([propTypes.string, propTypes.array, propTypes.shape({}), propTypes.element]),
  html: propTypes.string,
  url: propTypes.oneOfType([propTypes.string, propTypes.shape({})]),
};

module.exports = () => Embed;
