// require('./style.scss');

const React = require('react');
const PropTypes = require('prop-types');
const syntaxHighlighter = require('@readme/syntax-highlighter');

function Code(props) {
  const { className, children, lang, meta } = props;
  const language = (className || '').replace('language-', '');

  return (
    <code className={language ? `lang-${language}` : null} data-lang={lang} name={meta}>
      {/* {children} */}
      {syntaxHighlighter(children[0], language, { tokenizeVariables: true })}
    </code>
  );
}

Code.propTypes = {
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.string,
};

Code.defaultProps = {
  className: '',
  lang: '',
  meta: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className', 'lang', 'meta', 'value'];
  return Code;
};
