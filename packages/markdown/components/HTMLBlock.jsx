/* eslint-disable no-eval
 */
const React = require('react');
const PropTypes = require('prop-types');

/**
 * @arg {string} html the HTML from which to extract script tags.
 */
const extractScripts = html => {
  const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gim;
  const scripts = [...html.matchAll(regex)].map(m => m[1].trim());
  return () => scripts.map(js => window.eval(js));
};

class HTMLBlock extends React.Component {
  constructor(props) {
    super(props);
    if ('scripts' in this.props) this.runScripts = extractScripts(this.props.html);
  }

  componentDidMount() {
    if ('scripts' in this.props) this.runScripts();
  }

  render() {
    const { html: __html } = this.props;
    return <div className="rdmd-html" dangerouslySetInnerHTML={{ __html }} />;
  }
}

HTMLBlock.propTypes = {
  html: PropTypes.string,
  scripts: PropTypes.any,
};

module.exports = sanitize => {
  sanitize.tagNames.push('html-block');
  sanitize.attributes['html-block'] = ['html', 'scripts'];
  return HTMLBlock;
};
