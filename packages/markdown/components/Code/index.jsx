require('./style.scss');

const React = require('react');
const PropTypes = require('prop-types');
const syntaxHighlighter = require('@readme/syntax-highlighter');

function Code(props) {
  const { className, children, lang, meta } = props;
  const language = (className || '').replace('language-', '');

  return (
    <code className={language ? `lang-${language}` : null} name={meta} data-lang={lang}>
      {syntaxHighlighter(children[0], language, { tokenizeVariables: true })}
      {/* children */}
    </code>
  );
}

Code.propTypes = {
  className: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
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
