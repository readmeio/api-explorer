const React = require('react');
const PropTypes = require('prop-types');

const BaseUrlContext = require('../contexts/BaseUrl');

// Nabbed from here:
// https://github.com/readmeio/api-explorer/blob/0dedafcf71102feedaa4145040d3f57d79d95752/packages/api-explorer/src/lib/markdown/renderer.js#L52
function getHref(href, baseUrl) {
  const base = baseUrl === '/' ? '' : baseUrl;
  const doc = href.match(/^doc:([-_a-zA-Z0-9#]*)$/);
  if (doc) {
    return `${base}/docs/${doc[1]}`;
  }

  const ref = href.match(/^ref:([-_a-zA-Z0-9#]*)$/);
  if (ref) {
    return `${base}/reference-link/${ref[1]}`;
  }

  // we need to perform two matches for changelogs in case
  // of legacy links that use 'blog' instead of 'changelog'
  const blog = href.match(/^blog:([-_a-zA-Z0-9#]*)$/);
  const changelog = href.match(/^changelog:([-_a-zA-Z0-9#]*)$/);
  const changelogMatch = blog || changelog;
  if (changelogMatch) {
    return `${base}/changelog/${changelogMatch[1]}`;
  }

  const custompage = href.match(/^page:([-_a-zA-Z0-9#]*)$/);
  if (custompage) {
    return `${base}/page/${custompage[1]}`;
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
  return (
    <a href={getHref(props.href, props.baseUrl)} target="_self" {...docLink(props.href)}>
      {props.children}
    </a>
  );
}

Anchor.propTypes = {
  href: PropTypes.string,
  baseUrl: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Anchor.defaultProps = {
  href: '',
  baseUrl: '/',
};

module.exports = sanitizeSchema => {
  // This is for our custom link formats
  sanitizeSchema.protocols.href.push('doc', 'ref', 'blog', 'changelog', 'page');

  return props => (
    <BaseUrlContext.Consumer>
      {baseUrl => <Anchor baseUrl={baseUrl} {...props} />}
    </BaseUrlContext.Consumer>
  );
};
