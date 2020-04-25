const React = require('react');
const PropTypes = require('prop-types');

// Only load CodeMirror in the browser, for SSR
// apps. Necessary because of people like this:
// https://github.com/codemirror/CodeMirror/issues/3701#issuecomment-164904534
const syntaxHighlighter = typeof window !== 'undefined' ? require('@readme/syntax-highlighter') : false;
const copy = require('copy-to-clipboard');

const remapLang = {
  c: 'cplusplus',
  'c++': 'cplusplus',
  cpp: 'cplusplus',
  docker: 'dockerfile',
  html: 'htmlmixed',
  js: 'javascript',
  py: 'python',
  sh: 'shell',
  bash: 'shell',
  mysql: 'sql',
};

function Code(props) {
  const { children, lang, meta } = props;
  const language = lang in remapLang ? remapLang[lang] : lang;
  const classes = ['rdmd-code', `lang-${language}`];
  return (
    <code className={classes.join(' ')} data-lang={language} name={meta}>
      {!syntaxHighlighter || (
        <button onClick={() => copy(children[0])}>
          <i className="fa fa-copy"></i>
        </button>
      )}
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
