const React = require('react');
const PropTypes = require('prop-types');

require('./style.scss');

const Callout = props => {
  const { attributes, children, node } = props;
  // console.log([attributes, node]);
  const { theme } = (node && node.data.toJSON()) || props || {};
  /* ^Deal with varying methods of passing props
   * between the hast-util and slate-mdast-serializer.
   */
  const content = children.splice(1);
  const heading = children[0].props.children; // eek...

  return (
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
  calloutStyle: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  attributes: PropTypes.shape({}),
  node: PropTypes.shape(),
};

Callout.defaultProps = {
  calloutStyle: 'info',
  attributes: null,
  node: null,
};

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes['rdme-callout'] = ['icon', 'theme', 'title', 'value'];
  return Callout;
};
