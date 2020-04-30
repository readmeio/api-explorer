const React = require('react');
const PropTypes = require('prop-types');

const Callout = props => {
  let { children } = props;
  const { attributes, theme, title, icon } = props;
  const content = title ? children.splice(1) : children;
  children = title ? children : '';
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <blockquote {...attributes} className={`callout callout_${theme}`} theme={icon}>
      <h3 className={`callout-heading ${!title && 'empty'}`}>
        <span className="callout-icon">{icon}</span>
        {children}
      </h3>
      {(content.length && content) || (!title ? children : '')}
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
