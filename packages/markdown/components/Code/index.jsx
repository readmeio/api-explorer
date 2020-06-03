const React = require('react');
const PropTypes = require('prop-types');

// Only load CodeMirror in the browser, for SSR
// apps. Necessary because of people like this:
// https://github.com/codemirror/CodeMirror/issues/3701#issuecomment-164904534
const syntaxHighlighter = typeof window !== 'undefined' ? require('@readme/syntax-highlighter') : false;
const canonicalLanguage = require('@readme/syntax-highlighter/canonical');
const copy = require('copy-to-clipboard');

function CopyCode({ code, rootClass = 'rdmd-code-copy', className = '' }) {
  const copyClass = `${rootClass}_copied`;
  const button = React.createRef();
  /* istanbul ignore next */
  const copier = () => {
    if (copy(code)) {
      const $el = button.current;
      $el.classList.add(copyClass);
      setTimeout(() => $el.classList.remove(copyClass), 1500);
    }
  };
  return <button ref={button} className={`${rootClass} ${className}`} onClick={copier} />;
}

CopyCode.propTypes = {
  className: PropTypes.string,
  code: PropTypes.string,
  rootClass: PropTypes.string,
};

function Code(props) {
  const { className, children, lang, meta } = props;

  const langClass = className.search(/lang(?:uage)?-\w+/) >= 0 ? className.match(/\s?lang(?:uage)?-(\w+)/)[1] : '';
  const language = canonicalLanguage(lang) || langClass;

  return (
    <React.Fragment>
      <code className={['rdmd-code', `lang-${language}`].join(' ')} data-lang={language} name={meta}>
        {!syntaxHighlighter || <CopyCode className="fa" code={children[0]} />}
        {syntaxHighlighter ? syntaxHighlighter(children[0], language, { tokenizeVariables: true }) : children[0]}
      </code>
    </React.Fragment>
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
