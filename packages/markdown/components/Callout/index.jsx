const React = require('react');
const PropTypes = require('prop-types');

require('./style.scss');

const Callout = props => {
  const { attributes, children, node } = props;

  /* Deal with varying methods of passing props
   * between the hast-util and slate-mdast-serializer.
   */
  const { theme } = (node && node.data.toJSON()) || props || {};

  const content = children.splice(1);
  const heading = children[0].props.children; // eek...

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <blockquote {...attributes} className={`callout callout_${theme}`}>
      <h3>
        <span>{heading[0]}</span>
        {heading[1]}
      </h3>
      {content}
    </blockquote>
  );
};

Callout.propTypes = {
  attributes: PropTypes.shape({}),
  calloutStyle: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  node: PropTypes.shape(),
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
