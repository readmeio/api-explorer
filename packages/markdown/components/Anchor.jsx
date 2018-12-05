const React = require('react');
const PropTypes = require('prop-types');

// Nabbed from here:
// https://github.com/readmeio/api-explorer/blob/0dedafcf71102feedaa4145040d3f57d79d95752/packages/api-explorer/src/lib/markdown/renderer.js#L52
function getHref(href) {
  const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
  if (doc) {
    return `/docs/${doc[1]}`;
  }

  const ref = href.match(/^ref:([-_a-zA-Z0-9#]*)$/);
  if (ref) {
    return `/reference-link/${ref[1]}`;
  }

  const blog = href.match(/^blog:([-_a-zA-Z0-9#]*)$/);
  if (blog) {
    return `/blog/${blog[1]}`;
  }

  const custompage = href.match(/^page:([-_a-zA-Z0-9#]*)$/);
  if (custompage) {
    return `/page/${custompage[1]}`;
  }

  return href;
}

function docLink(href) {
  const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
  if (!doc) return false;

  return {
    className: 'doc-link',
    'data-sidebar': doc[1],
  };
}

function Anchor(props) {
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a {...props} target="_self" href={getHref(props.href)} {...docLink(props.href)} />;
}

Anchor.propTypes = {
  href: PropTypes.string,
};

Anchor.defaultProps = {
  href: '',
};

module.exports = sanitizeSchema => {
  // This is for our custom link formats
  sanitizeSchema.protocols.href.push('doc', 'ref', 'blog', 'page');

  return Anchor;
};
