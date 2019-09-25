/* eslint-disable */
const React = require('react');
const PropTypes = require('prop-types');
// const syntaxHighlighter = require('@readme/syntax-highlighter');

function Code(props) {
  const { className, children } = props;
  const language = (className||'').replace('language-', '');

  return (
    <code className={language ? `lang-${language}` : null}>
      {/* {syntaxHighlighter(
        children[0],
        language,
        { tokenizeVariables: true },
      )} */}
      {children}
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
  // this is for code blocks class name
  sanitizeSchema.attributes.code = ['className'];
  return Code;
};
