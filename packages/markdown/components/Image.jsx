const React = require('react');
const PropTypes = require('prop-types');

const Image = props => {
  const [title, align, width = 'auto', height = 'auto'] = props.title
    ? props.title.split(', ')
    : [];
  const extras = { title, align, width, height };
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <img {...props} alt={props.alt} {...extras} />;
};

Image.propTypes = {
  align: PropTypes.string,
  alt: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  src: PropTypes.string,
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Image.defaultProps = {
  align: '',
  alt: 'Image Alternate Text',
  height: '',
  src: '',
  title: '',
  width: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.img = ['className', 'title', 'alt', 'width', 'height', 'align', 'src'];
  return Image;
};
