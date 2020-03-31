const React = require('react');
const PropTypes = require('prop-types');
// const syntaxHighlighter = require('@readme/syntax-highlighter');

class CodeClass extends React.Component {
  render() {
    const { className, children, lang, meta } = this.props;
    const language = (className || '').replace('language-', '');
    return (
      <code className={language ? `lang-${language}` : null} data-lang={lang} name={meta}>
        {children[0]}
        {/* {syntaxHighlighter(children[0], language, { tokenizeVariables: true })} */}
      </code>
    );
  }
}

CodeClass.propTypes = {
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.string,
};

CodeClass.defaultProps = {
  className: '',
  lang: '',
  meta: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className', 'lang', 'meta', 'value'];
  return CodeClass;
};
