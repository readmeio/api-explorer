const React = require('react');
const PropTypes = require('prop-types');

const syntaxHighlighter = require('@readme/syntax-highlighter').default;

function Code({ className, children }) {
  const language = className.replace('language-', '');

  return (
    <code className={language ? `lang-${language}` : null}>
      {syntaxHighlighter(children[0], language, { tokenizeVariables: true })}
    </code>
  );
}

Code.propTypes = {
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

Code.defaultProps = {
  className: '',
};

module.exports = sanitizeSchema => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className'];

  return Code;
};
