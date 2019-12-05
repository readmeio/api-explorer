const React = require('react');
const PropTypes = require('prop-types');

const Image = props => {
  // @todo refactor this in to own component
  const [title, align, width = 'auto', height = 'auto'] = props.title
    ? props.title.split(', ')
    : [];
  const extras = { title, align, width, height };
  return <img {...props} {...extras} />;
};

Image.propTypes = {
  title: PropTypes.string,
  align: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  alt: PropTypes.string,
  src: PropTypes.string,
};

Image.defaultProps = {
  title: '',
  align: '',
  width: '',
  height: '',
  alt: '',
  src: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className', 'title', 'alt', 'width', 'height', 'align', 'src'];
  return Image;
};
