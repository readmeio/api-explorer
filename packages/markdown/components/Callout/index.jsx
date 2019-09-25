/* eslint-disable */
const React = require('react');
// const PropTypes = require('prop-types');

// require('./style.scss');

const Callout = (props, ...rest) => {
  const {attributes, children, node} = props;
  const {theme} = node && node.data.toJSON() || props || {};
    //^This is to deal with different^
    // methods of passing props btwn
    // the hast-util's hProps and our 
    // slate-mdast-serializer.
  return (<blockquote {...attributes} className={`callout callout_${theme}`}>
    {children}
  </blockquote>);
};

// Callout.propTypes = {
//   calloutStyle: PropTypes.string,
//   children: PropTypes.arrayOf(PropTypes.any).isRequired,
// };

// Callout.defaultProps = {
//   calloutStyle: 'info',
// };

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes['rdme-callout'] = ['icon', 'theme', 'title', 'value'];
  return Callout
}