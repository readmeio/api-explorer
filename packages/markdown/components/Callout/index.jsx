const React = require('react');
const PropTypes = require('prop-types');

const Callout = props => {
  const { attributes, children } = props;
  const content = children.splice(1);

  /* deal with differing data structures between the
   * hast-util's hProps and Slate's MDAST serializer
   */
  const { theme, title } = props;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <blockquote {...attributes} className={`callout callout_${theme}`}>
      <h3 className={[!title && 'floated']}>{children}</h3>
      {content}
    </blockquote>
  );
};

Callout.propTypes = {
  attributes: PropTypes.shape({}),
  calloutStyle: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  node: PropTypes.shape(),
  theme: PropTypes.string,
  title: PropTypes.string,
};

Callout.defaultProps = {
  attributes: null,
  calloutStyle: 'info',
  node: null,
};

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes['rdme-callout'] = ['icon', 'theme', 'title', 'value'];
  return Callout;
};
