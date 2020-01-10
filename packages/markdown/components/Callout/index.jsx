// There's a bug in jsdom where Jest spits out heaps of errors from it not being able to interpret
// this file, so let's not include this when running tests since we aren't doing visual testing
// anyways.
// https://github.com/jsdom/jsdom/issues/217
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require
  require('./style.scss');
}

const React = require('react');
const PropTypes = require('prop-types');

const Callout = props => {
  const { attributes, children, node } = props;
  const content = children.splice(1);

  /* deal with differing data structures between the
   * hast-util's hProps and Slate's MDAST serializer
   */
  const { theme, title } = (node && node.data.toJSON()) || props || {};

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
