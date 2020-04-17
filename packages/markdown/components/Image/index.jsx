/* eslint-disable react/jsx-props-no-spreading */

const React = require('react');
const PropTypes = require('prop-types');

const Image = props => {
  const { align, title, alt, width, height } = props;
  const extras = { align, width, height };
  return <img {...props} alt={alt} title={title} {...extras} loading="lazy" />;
};

Image.propTypes = {
  align: PropTypes.string,
  alt: PropTypes.string,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
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
