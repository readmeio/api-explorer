/* eslint-disable react/jsx-props-no-spreading */

const React = require('react');
const PropTypes = require('prop-types');

const Image = props => {
  const [title, align, width = 'auto', height = 'auto'] = props.title
    ? props.title.split(', ')
    : [];
  const extras = { align, width, height };
  if (props.caption)
    return (
      <figure {...extras} style={{ width: extras.width }}>
        <img {...props} alt={props.alt} title={title} />
        <figcaption>{props.caption}</figcaption>
      </figure>
    );
  return <img {...props} alt={props.alt} title={title} {...extras} />;
};

Image.propTypes = {
  align: PropTypes.string,
  alt: PropTypes.string,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  src: PropTypes.string,
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Image.defaultProps = {
  align: '',
  alt: '',
  caption: '',
  height: '',
  src: '',
  title: '',
  width: '',
};

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes.img = [
    'className',
    'title',
    'alt',
    'width',
    'height',
    'align',
    'src',
    'caption',
  ];
  return Image;
};
