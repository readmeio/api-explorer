const React = require('react');
const PropTypes = require('prop-types');
const syntaxHighlighter = require('@readme/syntax-highlighter');

require('@readme/syntax-highlighter/node_modules/codemirror/lib/codemirror.css');
require('@readme/syntax-highlighter/node_modules/codemirror/theme/neo.css');

function Code(props) {
  const { className, children } = props;
  const language = (className || '').replace('language-', '');

  return (
    <code className={language ? `lang-${language}` : null}>
      {syntaxHighlighter(children[0], language, { tokenizeVariables: true })}
      {/* children */}
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
