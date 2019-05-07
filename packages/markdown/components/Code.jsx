const React = require('react');
const PropTypes = require('prop-types');

const syntaxHighlighter = require('@mia-platform/syntax-highlighter');

function Code({ className, children }) {
  const language = className.replace('language-', '');

  return (
    <code className={language ? `lang-${language}` : null}>
      {syntaxHighlighter(children[0], language, { tokenizeVariables: true })}
    </code>
  );
}

Code.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Code.defaultProps = {
  className: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className'];

  return Code;
};
