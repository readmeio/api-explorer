const React = require('react');
const PropTypes = require('prop-types');

const Image = props => {
  const [title, align, width = 'auto', height = 'auto'] = props.title
    ? props.title.split(', ')
    : [];
  const extras = { title, align, width, height };
  return <img {...props} alt={props.alt} {...extras} />;
};

Image.propTypes = {
  title: PropTypes.string,
  align: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  alt: PropTypes.string,
  src: PropTypes.string,
};

Image.defaultProps = {
  title: '',
  align: '',
  width: '',
  height: '',
  alt: 'Image Alternate Text',
  src: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.img = ['className', 'title', 'alt', 'width', 'height', 'align', 'src'];
  return Image;
};
