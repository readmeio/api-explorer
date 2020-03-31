const React = require('react');
const PropTypes = require('prop-types');

// Only load CodeMirror in the browser, for SSR
// apps. Necessary because of people like this:
// https://github.com/codemirror/CodeMirror/issues/3701#issuecomment-164904534
const syntaxHighlighter = typeof window !== 'undefined' ? require('@readme/syntax-highlighter') : false;

function Code(props) {
  const { className, children, lang, meta } = props;
  const language = (className || '').replace('language-', '');
  return (
    <code className={language ? `lang-${language}` : null} data-lang={lang} name={meta}>
      {syntaxHighlighter ? syntaxHighlighter(children[0], language, { tokenizeVariables: true }) : children[0]}
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
