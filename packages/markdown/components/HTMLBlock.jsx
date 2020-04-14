const React = require('react');
const PropTypes = require('prop-types');

class HTMLBlock extends React.Component {
  render() {
    const { html } = this.props;
    return <div className="rdme-html" dangerouslySetInnerHTML={{ __html: html }} />;
  }
}

HTMLBlock.propTypes = {
  html: PropTypes.any,
};

module.exports = sanitize => {
  sanitize.tagNames.push('html-block');
  sanitize.attributes['html-block'] = ['html'];
  return HTMLBlock;
};
