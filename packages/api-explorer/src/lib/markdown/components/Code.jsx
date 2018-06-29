const React = require('react');
const PropTypes = require('prop-types');

const syntaxHighlighter = require('@readme/syntax-highlighter');

function Code({ className, children }) {
  const language = className.replace('language-', '');
  // eslint-disable-next-line react/no-danger
  return <code className={language ? `lang-${language}` : null} dangerouslySetInnerHTML={{ __html: syntaxHighlighter(children[0], language) }} />;
}

Code.propTypes = {
  className: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Code.defaultProps = {
  className: '',
};

module.exports = (sanitizeSchema) => {
  // This is for code blocks class name
  sanitizeSchema.attributes.code = ['className'];

  return Code;
};
