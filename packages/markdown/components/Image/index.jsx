/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/jsx-props-no-spreading */

const React = require('react');
const PropTypes = require('prop-types');

class Image extends React.Component {
  constructor(props) {
    super(props);
    this.state = { lightbox: false };
  }

  render() {
    const { align, title, alt, width, height, className = '' } = this.props;
    const extras = { align, width, height };
    return (
      <React.Fragment>
        <img
          {...this.props}
          alt={alt}
          title={title}
          {...extras}
          loading="lazy"
          onClick={() => className !== 'emoji' && this.setState({ lightbox: true })}
        />
        <span
          className="lightbox"
          onClick={() => this.setState({ lightbox: false })}
          onScrollCapture={() => this.setState({ lightbox: false })}
          open={this.state.lightbox}
          role="dialog"
        >
          <span className="lightbox-inner">
            <img {...this.props} alt={alt} title="Click to close..." {...extras} loading="lazy" />
          </span>
        </span>
      </React.Fragment>
    );
  }
}

Image.propTypes = {
  align: PropTypes.string,
  alt: PropTypes.string,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Image.defaultProps = {
  align: '',
  alt: '',
  caption: '',
  height: 'auto',
  src: '',
  title: '',
  width: 'auto',
};

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes.img = ['className', 'title', 'alt', 'width', 'height', 'align', 'src', 'longDesc'];
  return Image;
};
