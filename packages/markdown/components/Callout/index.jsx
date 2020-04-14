const React = require('react');
const PropTypes = require('prop-types');

const Callout = props => {
  const { attributes, children } = props;
  const content = children.splice(1);

  /* deal with differing data structures between the
   * hast-util's hProps and Slate's MDAST serializer
   */
  const { theme, title, icon } = props;
  const titleProps = children.length && children[0].props; // @rafegoldberg sucks
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <blockquote {...attributes} className={`callout callout_${theme}`} theme={icon}>
      <h3 className={`callout-heading ${!title && 'empty'}`}>
        <span className="callout-icon">{icon}</span>{' '}
        {('children' in titleProps && titleProps.children.splice(1)[0]) || title}
      </h3>
      {content}
    </blockquote>
  );
};

Callout.propTypes = {
  attributes: PropTypes.shape({}),
  calloutStyle: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  icon: PropTypes.string,
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
